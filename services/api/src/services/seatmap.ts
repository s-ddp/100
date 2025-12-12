import { getPrismaClient } from "../core/prisma";

const ACTIVE_ORDER_STATUSES = ["PAID", "PENDING"];

export async function checkSeatAvailable(eventId: string, seatId: string) {
  const prisma = getPrismaClient();
  if (!prisma) {
    throw new Error("Prisma client is not configured");
  }

  const now = new Date();
  const activeLocks = await (prisma as any).seatLock.findMany({
    where: {
      eventId,
      seatId,
      lockedUntil: {
        gt: now,
      },
      status: "LOCKED",
    },
  });

  if (activeLocks.length > 0) {
    return false;
  }

  const seatOrders = await (prisma as any).orderSeat.findMany({
    where: { seatId },
    include: { order: true },
  });

  const hasBookedSeat = seatOrders.some((entry: any) => {
    if (!entry.order) return false;
    const status = entry.order.status;
    return entry.order.eventId === eventId && ACTIVE_ORDER_STATUSES.includes(status);
  });

  return !hasBookedSeat;
}
