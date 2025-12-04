import { Router } from "../vendor/express.js";
import { astraClient } from "../core/astraClient.js";
import { getPrismaClient } from "../core/prisma.js";

interface MemoryOrderItem {
  seatCode?: string;
  ticketTypeId?: string;
  priceTypeId?: string;
  seatCategoryId?: string;
  quantity: number;
  price?: number;
}

interface MemoryOrder {
  id: number;
  externalOrderId: string;
  eventId: string;
  sessionId?: string;
  email?: string;
  status: string;
  amount?: number;
  items: MemoryOrderItem[];
  astraResponse?: unknown;
}

const memoryOrders: MemoryOrder[] = [];

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
    let orderIdNumeric: number;

    if (prisma) {
      const order = await (prisma as any).order.create({
        data: {
          externalOrderId: orderID,
          eventId,
          sessionId,
          email,
          status: "pending",
          amount: astraResp.orderAmount ?? null,
          astraResponse: astraResp,
        },
      });

      orderIdNumeric = order.id;

      if (Array.isArray(astraResp.orderedSeats)) {
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
    } else {
      orderIdNumeric = memoryOrders.length + 1;
      memoryOrders.push({
        id: orderIdNumeric,
        externalOrderId: orderID,
        eventId,
        sessionId,
        email,
        status: "pending",
        amount: astraResp.orderAmount ?? undefined,
        astraResponse: astraResp,
        items: (astraResp.orderedSeats ?? []).map((seat: any) => ({
          seatCode: seat.seatID ?? undefined,
          ticketTypeId: seat.ticketTypeID ?? undefined,
          priceTypeId: seat.priceTypeID ?? undefined,
          seatCategoryId: seat.seatCategoryID ?? undefined,
          quantity: seat.quantityOfTickets ?? 1,
          price: seat.price ?? undefined,
        })),
      });
    }

    res.status(201).json({
      id: orderIdNumeric,
      externalOrderId: orderID,
      status: "pending",
      amount: astraResp.orderAmount,
    });
  } catch (err) {
    next(err);
  }
});

ordersRouter.post("/:id/confirm", async (req, res, next) => {
  try {
    const { id } = req.params ?? {};
    if (!id) {
      return res.status(400).json({ error: "id is required" });
    }
    const { confirm } = req.body as { confirm: boolean };

    const prisma = getPrismaClient();
    let order: { id: number; externalOrderId: string | null; email: string | null } | null = null;

    if (prisma) {
      order = await (prisma as any).order.findUnique({ where: { id: Number(id) }, select: { id: true, externalOrderId: true, email: true } });
    } else {
      const mem = memoryOrders.find((o) => o.id === Number(id));
      if (mem) {
        order = { id: mem.id, externalOrderId: mem.externalOrderId, email: mem.email ?? null };
      }
    }

    if (!order || !order.externalOrderId) {
      return res.status(404).json({ error: "Order not found" });
    }

    const astraResp = await astraClient.confirmPayment({
      orderID: order.externalOrderId,
      orderConfirm: confirm ?? true,
      email: order.email ?? undefined,
    });

    if (prisma) {
      await (prisma as any).order.update({
        where: { id: Number(id) },
        data: { status: astraResp.orderPaymentConfirmed ? "paid" : "error", astraResponse: astraResp },
      });
    } else {
      const mem = memoryOrders.find((o) => o.id === Number(id));
      if (mem) {
        mem.status = astraResp.orderPaymentConfirmed ? "paid" : "error";
        mem.astraResponse = astraResp;
      }
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

    if (prisma) {
      const order = await (prisma as any).order.findUnique({
        where: { id: Number(id) },
        include: { items: true, payments: true, event: true },
      });

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      return res.json(order);
    }

    const mem = memoryOrders.find((o) => o.id === Number(id));
    if (!mem) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(mem);
  } catch (err) {
    next(err);
  }
});
