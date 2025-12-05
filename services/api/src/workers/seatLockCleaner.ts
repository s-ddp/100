import { getPrismaClient } from "../core/prisma";

async function cancelExternalBooking(externalBookingId: string) {
  // TODO: integrate with provider cancel logic when available
  console.log("[SeatLockCleaner] cancel external booking", externalBookingId);
}

export async function cleanExpiredSeatLocks() {
  const prisma = getPrismaClient();
  if (!prisma) return;

  const now = new Date();
  const expiredLocks = await (prisma as any).seatLock.findMany({
    where: {
      expiresAt: {
        lt: now,
      },
    },
  });

  if (!expiredLocks.length) return;

  console.log(`[SeatLockCleaner] Found ${expiredLocks.length} expired locks`);

  for (const lock of expiredLocks) {
    if (lock.externalBookingId) {
      await cancelExternalBooking(lock.externalBookingId);
    }
  }

  await (prisma as any).seatLock.deleteMany({
    where: {
      id: {
        in: expiredLocks.map((l: any) => l.id),
      },
    },
  });

  console.log("[SeatLockCleaner] Cleanup done");
}

export function startSeatLockCleaner(intervalMs = 30000) {
  console.log("[SeatLockCleaner] Worker started");
  setInterval(async () => {
    try {
      await cleanExpiredSeatLocks();
    } catch (err) {
      console.error("[SeatLockCleaner] Error:", err);
    }
  }, intervalMs);
}

if (require.main === module) {
  startSeatLockCleaner();
}
