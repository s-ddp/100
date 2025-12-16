import { prisma } from "../utils/prisma.js";

const LOCK_TTL_MS = 15 * 60 * 1000; // 15 минут

export async function getAvailableSeatsForEvent(eventId: string) {
  const now = new Date();

  // Авто-экспирация просроченных локов (мягко в запросе)
  // (Для скорости можно вынести в cron/worker, но здесь подстрахуемся)
  await prisma.seatLock.updateMany({
    where: { eventId, lockedUntil: { lt: now }, status: "LOCKED" },
    data: { status: "EXPIRED" },
  });

  // Занятые местами считаем: оплаченные, и "живые" локи.
  const paidSeatIds = (
    await prisma.orderItem.findMany({
      where: {
        eventId,
        seatId: { not: null },
        order: { status: "PAID" },
      },
      select: { seatId: true },
    })
  ).map((s) => s.seatId!);

  const lockedSeatIds = (
    await prisma.seatLock.findMany({
      where: {
        eventId,
        status: "LOCKED",
        lockedUntil: { gt: now },
      },
      select: { seatId: true },
    })
  ).map((s) => s.seatId);

  const busy = new Set([...paidSeatIds, ...lockedSeatIds]);

  const seats = await prisma.seat.findMany({
    where: { eventId, isActive: true },
    select: {
      id: true,
      externalId: true,
      label: true,
      zone: true,
      category: { select: { id: true, code: true, name: true } },
    },
    orderBy: [{ zone: "asc" }, { label: "asc" }],
  });

  return seats.map((s) => ({
    id: s.id,
    externalId: s.externalId,
    label: s.label,
    zone: s.zone,
    category: s.category
      ? {
          id: s.category.id,
          code: s.category.code,
          name: s.category.name,
        }
      : null,
    status: busy.has(s.id) ? "UNAVAILABLE" : "AVAILABLE",
  }));
}
