import { Router } from "../vendor/express";
import { astraClient } from "../core/astraClient";
import { getPrismaClient } from "../core/prisma";

export const ordersRouter = Router();

ordersRouter.post("/", async (req, res, next) => {
  try {
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
    const order = prisma
      ? await (prisma as any).order.create({
          data: {
            externalOrderId: orderID,
            eventId,
            sessionId,
            email,
            status: "pending",
            amount: astraResp.orderAmount ?? null,
            astraResponse: astraResp,
          },
        })
      : null;

    if (prisma && Array.isArray(astraResp.orderedSeats)) {
      for (const seat of astraResp.orderedSeats) {
        await (prisma as any).orderItem.create({
          data: {
            orderId: order.id,
            seatCode: seat.seatID ?? null,
            ticketTypeId: seat.ticketTypeID ?? null,
            priceTypeId: seat.priceTypeID ?? null,
            seatCategoryId: seat.seatCategoryID ?? null,
            quantity: seat.quantityOfTickets ?? 1,
            price: seat.price ?? null,
          },
        });
      }
    }

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
    const order = prisma ? await (prisma as any).order.findUnique({ where: { id: Number(id) } }) : null;
    if (!order || !order.externalOrderId) {
      return res.status(404).json({ error: "Order not found" });
    }

    const astraResp = await astraClient.confirmPayment({
      orderID: order.externalOrderId,
      orderConfirm: confirm ?? true,
      email: order.email,
    });

    if (prisma) {
      await (prisma as any).order.update({
        where: { id: order.id },
        data: {
          status: astraResp.orderPaymentConfirmed ? "paid" : "error",
          astraResponse: astraResp,
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

ordersRouter.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params ?? {};
    if (!id) {
      return res.status(400).json({ error: "id is required" });
    }

    const prisma = getPrismaClient();
    if (!prisma) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = await (prisma as any).order.findUnique({
      where: { id: Number(id) },
      include: { items: true, payments: true, event: true },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
});

export function createOrdersRouter() {
  return ordersRouter;
}
