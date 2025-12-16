import { cleanExpiredSeatLocks, startSeatLockCleanup } from "./seatLockCleanup.js";

export { cleanExpiredSeatLocks };

export function startSeatLockCleaner(intervalMs = 30000) {
  // Backwards-compatible entry point that mirrors the cron-driven worker
  if (intervalMs !== 30000) {
    // fall back to simple interval if a custom timing was requested
    console.log("[SeatLockCleaner] Worker started");
    setInterval(async () => {
      try {
        await cleanExpiredSeatLocks();
      } catch (err) {
        console.error("[SeatLockCleaner] Error:", err);
      }
    }, intervalMs);
    return;
  }

  startSeatLockCleanup();
}

if (require.main === module) {
  startSeatLockCleanup();
}
