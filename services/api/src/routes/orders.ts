import { Router } from "../vendor/express.js";
import { astraClient } from "../core/astraClient.js";
import { getPrismaClient } from "../core/prisma.js";
import {
  createSeatOrder,
  findPrice,
  findSeatMapForEvent,
  getSeatCategoryForSeat,
  reservationKey,
  resolveEvent,
  resolveTrip,
  seatOrders,
  seatReservations,
} from "../core/waterStore.js";
import { emitSeatStatus } from "../ws/seatmapHub.js";
import { CRM_ORDER_STATUS } from "../services/crmOrdersService.js";
import { createOrderRouter } from "./orders/createOrder.js";

export const ordersRouter = Router();

ordersRouter.use("/checkout", createOrderRouter);

ordersRouter.post("/", async (req, res, next) => {
  try {
    const { seats, eventId: waterEventId } = req.body as any;
    if (Array.isArray(seats)) {
      const { tripId, ticketTypeId = "adult", sessionID, customer } = req.body as any;

      if (!waterEventId) {
        return res.status(400).json({ error: "eventId is required" });
      }
      const event = resolveEvent(waterEventId);
      if (!event) {
        return res.status(404).json({ error: "Event not found", eventId: waterEventId });
      }
      const trip = tripId ? resolveTrip(tripId) : null;
      if (tripId && !trip) {
        return res.status(404).json({ error: "Trip not found", tripId });
      }
      if (!customer?.name || !customer?.phone) {
        return res.status(400).json({ error: "Customer name and phone are required" });
      }
      if (!Array.isArray(seats) || seats.length === 0) {
        return res.status(400).json({ error: "At least one seat is required" });
      }

      const seatMap = findSeatMapForEvent(event.id);
      if (!seatMap && event.hasSeating) {
        return res.status(400).json({ error: "Seat map not configured for event", eventId: event.id });
      }

      let total = 0;
      const pricedSeats: { seatId: string; price: number }[] = [];
      const updatedSeats: string[] = [];

      for (const seatId of seats) {
        const category = getSeatCategoryForSeat(seatMap, seatId);
        if (!category) {
          return res.status(404).json({ error: "Seat not found", seatId });
        }

        const priceInfo = findPrice(event.id, category.id, ticketTypeId);
        if (!priceInfo) {
          return res.status(404).json({ error: "Price not found for seat", seatId, ticketTypeId });
        }

        const key = reservationKey(event.id, trip?.id ?? tripId, seatId);
        const existing = seatReservations.get(key);
        if (existing?.status === "sold") {
          return res.status(409).json({ error: "Seat already sold", seatId });
        }
        if (existing && existing.sessionId !== sessionID && existing.status === "reserved") {
          return res.status(409).json({ error: "Seat reserved by another session", seatId });
        }

        total += priceInfo.price;
        pricedSeats.push({ seatId, price: priceInfo.price });
        updatedSeats.push(seatId);
      }

      const order = createSeatOrder({
        eventId: event.id,
        tripId: trip?.id,
        seats: updatedSeats,
        ticketTypeId,
        customer,
        sessionId: sessionID,
      });
      order.totals.gross = total;

      const prisma = getPrismaClient();
      if (prisma) {
        try {
          const crmOrder = await (prisma as any).crmOrder.create({
            data: {
              eventId: event.id,
              customerName: customer.name,
              customerEmail: customer.email ?? null,
              customerPhone: customer.phone,
              status: CRM_ORDER_STATUS.LOCKED,
              totalPrice: Math.round(total),
              seats: {
                create: pricedSeats.map((entry) => ({ seatCode: entry.seatId, price: Math.round(entry.price) })),
              },
            },
            include: { seats: true, event: true },
          });
          order.crmOrderId = crmOrder.id;
        } catch (dbError) {
          console.warn("Failed to persist CRM order", dbError);
        }
      }

      updatedSeats.forEach((seatId) => {
        const key = reservationKey(event.id, trip?.id ?? tripId, seatId);
        seatReservations.set(key, {
          eventId: event.id,
          seatId,
          sessionId: sessionID || "order",
          tripId: trip?.id ?? tripId,
          status: "sold",
          orderId: order.id,
        });
        emitSeatStatus(event.id, seatId, "sold");
      });

      return res.status(201).json({ order });
    }

    const { sessionId, email, eventId, items, paymentTypeID = "" } = req.body as {
      sessionId: string;
      email: string;
      eventId: string;
      paymentTypeID?: string;
      items: {
        seatID?: string;
        priceTypeID: string;
        seatCategoryID?: string;
        ticketTypeID: string;
        quantityOfTickets?: number;
        resident?: boolean | "";
      }[];
    };

    if (!sessionId || !email || !eventId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "sessionId, email, eventId, items[] required" });
    }

    const orderID = `local_${Date.now()}`;

    const astraBody = {
      sessionID: sessionId,
      orderID,
      paymentTypeID,
      email,
      order: items.map((item) => ({
        eventID: eventId,
        seatID: item.seatID ?? "",
        priceTypeID: item.priceTypeID,
        seatCategoryID: item.seatCategoryID ?? "",
        ticketTypeID: item.ticketTypeID,
        menuID: "",
        quantityOfTickets: item.quantityOfTickets ?? 1,
        resident: item.resident ?? "",
      })),
    };

    const astraResp = await astraClient.registerOrder(astraBody);

    if (!astraResp.isOrderRegistred) {
      return res.status(400).json({
        error: "Astra registerOrder failed",
        description: astraResp.descriptionRegistredOrder,
      });
    }

    const prisma = getPrismaClient();
    const amountCents = Math.round((astraResp.orderAmount ?? 0) * 100);
    const order = prisma
      ? await (prisma as any).order.create({
          data: {
            id: orderID,
            eventId,
            status: "PENDING",
            totalAmount: amountCents,
            currency: "RUB",
            customerEmail: email,
          },
        })
      : null;

    res.status(201).json({
      id: order?.id ?? null,
      externalOrderId: orderID,
      status: order?.status ?? "pending",
      amount: order?.amount ?? astraResp.orderAmount ?? null,
    });
  } catch (err) {
    next(err);
  }
});

ordersRouter.post("/:id/confirm", async (req, res, next) => {
  try {
    const { id } = req.params ?? {};
    const { confirm } = req.body as { confirm: boolean };

    if (!id) {
      return res.status(400).json({ error: "id is required" });
    }

    const prisma = getPrismaClient();
    const order = prisma ? await (prisma as any).order.findUnique({ where: { id } }) : null;

    const orderIdForProvider = order?.id ?? id;
    const email = (req.body as any)?.email ?? order?.customerEmail;

    const astraResp = await astraClient.confirmPayment({
      orderID: orderIdForProvider,
      orderConfirm: confirm ?? true,
      email,
    });

    if (prisma && order) {
      await (prisma as any).order.update({
        where: { id: order.id },
        data: {
          status: astraResp.orderPaymentConfirmed ? "paid" : "error",
        },
      });
    }

    res.json({
      orderPaymentConfirmed: astraResp.orderPaymentConfirmed,
      descriptionOrderPayment: astraResp.descriptionOrderPayment,
    });
  } catch (err) {
    next(err);
  }
});

ordersRouter.post("/:id", async (req, res, next) => {
  const { id } = req.params ?? {};
  if (!id) {
    return res.status(400).json({ error: "id is required" });
  }

  const seatOrder = seatOrders.find((entry) => entry.id === id);
  if (seatOrder) {
    seatOrder.status = "confirmed";
    const prisma = getPrismaClient();
    if (prisma && seatOrder.crmOrderId) {
      try {
        await (prisma as any).crmOrder.update({
          where: { id: seatOrder.crmOrderId },
          data: { status: CRM_ORDER_STATUS.PAID },
        });
      } catch (dbError) {
        console.warn("Failed to mark CRM order as paid", dbError);
      }
    }
    return res.json({ order: seatOrder, provider: req.body?.provider ?? "mock", reference: req.body?.reference });
  }

  return next();
});

ordersRouter.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params ?? {};
    if (!id) {
      return res.status(400).json({ error: "id is required" });
    }

    const prisma = getPrismaClient();
    if (prisma) {
      const order = await (prisma as any).order.findUnique({
        where: { id },
        include: { items: true, payments: true, event: true },
      });

      if (order) {
        return res.json(order);
      }
    }

    const seatOrder = seatOrders.find((entry) => entry.id === id);
    if (!seatOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ order: seatOrder });
  } catch (err) {
    next(err);
  }
});

export function createOrdersRouter() {
  return ordersRouter;
}
