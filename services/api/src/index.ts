import { startApp } from "./app";
import { logger } from "./logger";
import { startSeatLockCleanup } from "./workers/seatLockCleanup";

async function bootstrap() {
  await startApp();
  startSeatLockCleanup();
}

bootstrap().catch((error) => {
  logger.error({ err: error }, "Failed to start API server");
  process.exit(1);
});
