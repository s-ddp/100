import { startApp } from "./app.js";
import { logger } from "./logger.js";
import { startSeatLockCleanup } from "./workers/seatLockCleanup.js";

async function bootstrap() {
  await startApp();
  startSeatLockCleanup();
}

bootstrap().catch((error) => {
  logger.error({ err: error }, "Failed to start API server");
  process.exit(1);
});
