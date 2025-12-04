import { astraClient } from "../core/astraClient";
import { getPrismaClient } from "../core/prisma";
import { emitSeatStatus } from "../ws/seatmapHub";

export async function cleanExpiredSeatLocks() {
  const prisma = getPrismaClient();
  if (!prisma) return;

  const now = new Date();
  const expiredLocks = await (prisma as any).seatLock.findMany({
    where: { expiresAt: { lt: now } },
  });

  if (!expiredLocks.length) return;

  console.log(`Found ${expiredLocks.length} expired seat locks, clearing...`);

  for (const lock of expiredLocks) {
    try {
      await astraClient.cancelBookSeat({
        eventID: lock.eventId,
        sessionID: lock.sessionId,
        seatID: lock.seatCode,
        email: process.env.ASTRA_EMAIL ?? undefined,
      });

      await (prisma as any).seatLock.delete({ where: { id: lock.id } });

      console.log(`Released seat ${lock.seatCode} for event ${lock.eventId} (lock #${lock.id})`);
      emitSeatStatus(lock.eventId, lock.seatCode, "free");
    } catch (err) {
      console.error(`Failed to release seat ${lock.seatCode} for event ${lock.eventId}:`, err);
    }
  }
}
