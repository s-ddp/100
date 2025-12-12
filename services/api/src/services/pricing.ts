import { getPrismaClient } from "../core/prisma";

export async function calculateOrderAmount(eventId: string, seatIds: string[]): Promise<number> {
  if (!Array.isArray(seatIds) || seatIds.length === 0) return 0;

  const prisma = getPrismaClient();
  if (!prisma) {
    throw new Error("Database not configured");
  }

  const seats = await (prisma as any).seat.findMany({
    where: {
      id: { in: seatIds },
      seatMap: { eventId },
    },
  });

  if (seats.length !== seatIds.length) {
    throw new Error("Some seats not found in DB");
  }

  const totalCents = seats.reduce((sum: number, seat: any) => {
    const price = Number(seat.basePrice ?? 0);
    const cents = Math.round(price * 100);
    return sum + cents;
  }, 0);

  return totalCents;
}
