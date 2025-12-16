import { astraClient } from "../core/astraClient.js";
import { getPrismaClient } from "../core/prisma.js";
import { emitSeatStatus } from "../ws/seatmapHub.js";

export const CRM_ORDER_STATUS = {
  PENDING: "PENDING",
  LOCKED: "LOCKED",
  PAID: "PAID",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
} as const;

export type CrmOrderStatus = (typeof CRM_ORDER_STATUS)[keyof typeof CRM_ORDER_STATUS];

function ensurePrisma() {
  const prisma = getPrismaClient();
  if (!prisma) {
    throw new Error("Database is not configured (missing DATABASE_URL)");
  }
  return prisma as any;
}

export async function listOrders(filters: {
  status?: CrmOrderStatus | string;
  eventId?: string;
  email?: string;
  phone?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const prisma = ensurePrisma();
  const where: any = {};

  if (filters.status) where.status = filters.status as CrmOrderStatus;
  if (filters.eventId) where.eventId = filters.eventId;
  if (filters.email) {
    where.customerEmail = { contains: filters.email, mode: "insensitive" };
  }
  if (filters.phone) {
    where.customerPhone = { contains: filters.phone, mode: "insensitive" };
  }
  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
    if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
  }

  return prisma.crmOrder.findMany({
    where,
    include: { seats: true, event: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(orderId: string) {
  const prisma = ensurePrisma();
  return prisma.crmOrder.findUnique({
    where: { id: orderId },
    include: { seats: true, event: true },
  });
}

export async function createOrder(payload: {
  eventId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  seats: { seatCode: string; price: number }[];
}) {
  const prisma = ensurePrisma();
  const { eventId, customerName, customerEmail, customerPhone, seats } = payload;

  if (!eventId) {
    throw new Error("eventId is required");
  }

  if (!Array.isArray(seats) || seats.length === 0) {
    throw new Error("At least one seat is required");
  }

  const totalPrice = seats.reduce((sum, s) => sum + (s.price || 0), 0);

  return prisma.crmOrder.create({
    data: {
      eventId,
      customerName,
      customerEmail,
      customerPhone,
      status: CRM_ORDER_STATUS.PENDING,
      totalPrice,
      seats: {
        create: seats.map((s) => ({ seatCode: s.seatCode, price: s.price })),
      },
    },
    include: { seats: true, event: true },
  });
}

export async function updateOrderStatus(orderId: string, status: CrmOrderStatus) {
  const prisma = ensurePrisma();
  return prisma.crmOrder.update({
    where: { id: orderId },
    data: { status },
    include: { seats: true, event: true },
  });
}

export async function cancelOrder(orderId: string) {
  const prisma = ensurePrisma();
  const order = await prisma.crmOrder.findUnique({
    where: { id: orderId },
    include: { seats: true },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  for (const seat of order.seats) {
    const lock = await prisma.waterSeatLock.findFirst({
      where: { seatCode: seat.seatCode, eventId: order.eventId },
    });

    if (lock?.sessionId) {
      try {
        await astraClient.cancelBookSeat({
          eventID: order.eventId,
          sessionID: lock.sessionId,
          seatID: seat.seatCode,
          email: process.env.ASTRA_EMAIL ?? undefined,
        });
      } catch (err) {
        console.error("Failed to cancel remote lock", err);
      }
    }

    await prisma.waterSeatLock.deleteMany({
      where: { seatCode: seat.seatCode, eventId: order.eventId },
    });
    emitSeatStatus(order.eventId, seat.seatCode, "free");
  }

  return prisma.crmOrder.update({
    where: { id: orderId },
    data: { status: CRM_ORDER_STATUS.CANCELLED },
    include: { seats: true, event: true },
  });
}
