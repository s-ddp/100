import cron from "node-cron";
import { getPrismaClient } from "../core/prisma";
import { cancelBookSeat } from "../services/providers/astramarin";

export async function cleanExpiredSeatLocks() {
  const prisma = getPrismaClient();
  if (!prisma) return;

  const now = new Date();
  const expiredLocks = await (prisma as any).seatLock.findMany({
    where: {
      expiresAt: { lt: now },
    },
  });

  if (!expiredLocks.length) return;

  console.log(`SeatLockCleanup: found ${expiredLocks.length} expired locks`);

  for (const lock of expiredLocks) {
    if (lock.externalBookingId) {
      await cancelBookSeat(lock.externalBookingId);
    }
    await (prisma as any).seatLock.delete({ where: { id: lock.id } });
  }
}

export function startSeatLockCleanupWorker() {
  console.log("SeatLockCleanup worker started (every 1 minute)");
  cron.schedule("*/1 * * * *", async () => {
    try {
      await cleanExpiredSeatLocks();
    } catch (e) {
      console.error("SeatLockCleanup error", e);
    }
  });
}

if (require.main === module) {
  startSeatLockCleanupWorker();
}
