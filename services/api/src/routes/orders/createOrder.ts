import { Router } from "../../vendor/express";
import { getPrismaClient } from "../../core/prisma";
import { checkSeatAvailable } from "../../services/seatmap";
import { yookassaCreatePayment } from "../../services/yookassa";

export const createOrderRouter = Router();

function parseSeatIds(seats: any): number[] {
  if (!Array.isArray(seats)) return [];
  return seats
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id) && id > 0);
}

createOrderRouter.post("/", async (req, res) => {
  try {
    const prisma = getPrismaClient();
    if (!prisma) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const eventId = Number(req.body?.eventId);
    const seatIds = parseSeatIds(req.body?.seats);
    const customer = req.body?.customer ?? {};

    if (!Number.isFinite(eventId)) {
      return res.status(400).json({ error: "eventId is required" });
    }
    if (!seatIds.length) {
      return res.status(400).json({ error: "seats are required" });
    }
    if (!customer?.name || !customer?.phone || !customer?.email) {
      return res.status(400).json({ error: "customer name, phone, and email are required" });
    }

    const seats = await (prisma as any).seat.findMany({ where: { id: { in: seatIds } } });
    if (seats.length !== seatIds.length) {
      return res.status(404).json({ error: "Some seats were not found" });
    }

    const unavailable: number[] = [];
    for (const seatId of seatIds) {
      const available = await checkSeatAvailable(eventId, seatId);
      if (!available) {
        unavailable.push(seatId);
      }
    }

    if (unavailable.length) {
      return res.status(409).json({ error: "Seats are not available", seats: unavailable });
    }

    const totalAmount = seats.reduce((sum: number, seat: any) => {
      const price = Number(seat.basePrice ?? 0);
      return sum + price;
    }, 0);

    const order = await (prisma as any).order.create({
      data: {
        eventId,
        status: "WAITING_FOR_PAYMENT",
        totalAmount,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
      },
    });

    await (prisma as any).orderSeat.createMany({
      data: seats.map((seat: any) => ({
        orderId: order.id,
        seatId: seat.id,
        price: seat.basePrice ?? null,
      })),
    });

    const payment = await yookassaCreatePayment({
      orderId: order.id,
      amount: totalAmount,
      description: `Оплата заказа #${order.id}`,
    });

    await (prisma as any).payment.create({
      data: {
        id: (payment as any).id,
        orderId: order.id,
        provider: "yookassa",
        status: "WAITING",
        externalId: (payment as any).id,
        amount: totalAmount,
      },
    });

    return res.status(201).json({
      orderId: order.id,
      paymentUrl: (payment as any)?.confirmation?.confirmation_url,
      paymentId: (payment as any)?.id,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error?.message ?? "Failed to create order" });
  }
});
