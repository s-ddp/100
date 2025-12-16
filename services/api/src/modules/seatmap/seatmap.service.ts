import { addMinutes } from "date-fns";
import { getPrismaClient } from "../../core/prisma.js";

type SeatStatus = "available" | "locked" | "booked";

export async function getSeatmapForEvent(eventId: string) {
  const prisma = getPrismaClient();
  if (!prisma) {
    throw new Error("Prisma client is not configured");
  }

  const seatMap = await (prisma as any).seatMap.findUnique({
    where: { eventId },
    include: { seats: true },
  });

  if (!seatMap) {
    throw new Error("SeatMap not found for event");
  }

  const locks = await (prisma as any).seatLock.findMany({
    where: {
      eventId,
      lockedUntil: {
        gt: new Date(),
      },
      status: "LOCKED",
    },
  });

  const lockedSeatIds = new Set((locks ?? []).map((lock: any) => lock.seatId));
  const bookedSeatIds = new Set<string>();

  const seatsWithStatus = (seatMap.seats ?? []).map((seat: any) => {
    let status: SeatStatus = "available";
    if (bookedSeatIds.has(seat.id)) status = "booked";
    else if (lockedSeatIds.has(seat.id)) status = "locked";

    return {
      id: seat.id,
      label: seat.label,
      row: seat.row,
      section: seat.section,
      priceZone: seat.priceZone,
      basePrice: seat.basePrice,
      status,
    };
  });

  return {
    eventId,
    seatMapId: seatMap.id,
    schemaJson: seatMap.schemaJson,
    seats: seatsWithStatus,
  };
}

export async function acquireSeatLocks(params: {
  eventId: string;
  seatIds: string[];
  sessionId: string;
  ttlMinutes?: number;
}) {
  const prisma = getPrismaClient();
  if (!prisma) {
    throw new Error("Prisma client is not configured");
  }

  const { eventId, seatIds, sessionId, ttlMinutes = 10 } = params;
  const now = new Date();

  const activeLocks = await (prisma as any).seatLock.findMany({
    where: {
      eventId,
      seatId: { in: seatIds },
      lockedUntil: {
        gt: now,
      },
      status: "LOCKED",
    },
  });

  if (activeLocks.length > 0) {
    return {
      success: false,
      conflictSeatIds: activeLocks.map((lock: any) => lock.seatId),
    };
  }

  const expiresAt = addMinutes(now, ttlMinutes);

  await (prisma as any).seatLock.createMany({
    data: seatIds.map((seatId) => ({
      eventId,
      seatId,
      bySessionId: sessionId,
      lockedUntil: expiresAt,
      status: "LOCKED",
    })),
  });

  return { success: true, expiresAt };
}

export async function releaseSeatLocks(params: {
  eventId: string;
  seatIds: string[];
  sessionId: string;
}) {
  const prisma = getPrismaClient();
  if (!prisma) {
    throw new Error("Prisma client is not configured");
  }

  const { eventId, seatIds, sessionId } = params;

  await (prisma as any).seatLock.deleteMany({
    where: {
      eventId,
      seatId: { in: seatIds },
      bySessionId: sessionId,
    },
  });

  return { success: true };
}
