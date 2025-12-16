import cron from "../legacy/shims/node-cron.js";
import { getPrismaClient } from "../core/prisma.js";
import { cancelBookSeat } from "../services/providers/astramarin.js";

export async function cleanExpiredSeatLocks() {
  const prisma = getPrismaClient();
  if (!prisma) return;

  const now = new Date();
  const expiredLocks = await (prisma as any).seatLock.findMany({
    where: {
      lockedUntil: { lt: now },
      status: "LOCKED",
    },
  });

  if (!expiredLocks.length) return;

  console.log(`SeatLockCleanup: found ${expiredLocks.length} expired locks`);

  for (const lock of expiredLocks) {
    if (lock.externalBookingId) {
      await cancelBookSeat(lock.externalBookingId);
    }
    await (prisma as any).seatLock.update({
      where: { id: lock.id },
      data: { status: "EXPIRED" },
    });
  }
}

export function startSeatLockCleanup() {
  console.log("SeatLockCleanup worker started (every 1 minute)");
  cron.schedule("*/1 * * * *", async () => {
    try {
      await cleanExpiredSeatLocks();
    } catch (e) {
      console.error("SeatLockCleanup error", e);
    }
  });
}
