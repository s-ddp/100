import { Router } from "../vendor/express";
import { prisma } from "../utils/prisma";

export const adminOrdersRouter = Router();

adminOrdersRouter.get("/", async (req, res) => {
  try {
    const { status, dateFrom, dateTo, page = "1", pageSize = "20" } = req.query as {
      status?: string;
      dateFrom?: string;
      dateTo?: string;
      page?: string;
      pageSize?: string;
    };

    const pageNum = Math.max(parseInt(page || "1", 10), 1);
    const sizeNum = Math.min(Math.max(parseInt(pageSize || "20", 10), 1), 100);

    const where: Record<string, any> = {};

    if (status) {
      where.status = status.toUpperCase();
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * sizeNum,
        take: sizeNum,
        include: {
          items: { include: { seat: true, ticketType: true } },
          seats: true,
          event: true,
        },
      }),
    ]);

    const data = orders.map((order) => {
      const seatsFromItems = order.items
        .filter((item) => item.seatId)
        .map((item) => item.seatId as string);
      const seatsFromOrderSeats = order.seats.map((seat) => seat.seatId);
      const seats = Array.from(new Set([...seatsFromItems, ...seatsFromOrderSeats]));

      return {
        id: order.id,
        status: order.status,
        customer: {
          name: order.customerName,
          phone: order.customerPhone,
          email: order.customerEmail,
        },
        total: order.totalAmount,
        currency: order.currency,
        createdAt: order.createdAt,
        event: order.event,
        seats,
      };
    });

    res.json({
      data,
      pagination: {
        total,
        page: pageNum,
        pageSize: sizeNum,
        totalPages: Math.ceil(total / sizeNum),
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

adminOrdersRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { seat: true, ticketType: true } },
        event: true,
        logs: { orderBy: { createdAt: "desc" } },
        seats: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

adminOrdersRouter.post("/:id/status", async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const { status } = req.body as { status?: string };

    const allowed = ["PENDING", "PAID", "CANCELLED", "REFUNDED"];
    const newStatus = status?.toUpperCase();

    if (!newStatus || !allowed.includes(newStatus)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Order not found" });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: newStatus as any },
    });

    await prisma.orderLog.create({
      data: {
        orderId: id,
        action: "status-change",
        oldValue: existing.status,
        newValue: newStatus,
        user: "admin",
      },
    });

    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

adminOrdersRouter.get("/:id/seatmap", async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, seats: true },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const seatIds = new Set<string>();
    order.items.forEach((item) => {
      if (item.seatId) seatIds.add(item.seatId);
    });
    order.seats.forEach((seat) => seatIds.add(seat.seatId));

    res.json({
      eventId: order.eventId,
      seats: Array.from(seatIds).map((seatId) => ({ seatId, status: "taken" })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});
