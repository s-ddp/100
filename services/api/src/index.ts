import { createApp } from "./app.js";
import { loadConfig } from "./config/env.js";
import { logger } from "./logger.js";
import { cleanExpiredSeatLocks } from "./workers/seatLockCleaner.js";

async function bootstrap() {
  const config = loadConfig();
  const app = createApp(config);

  if (app.listen) {
    app.listen(config.port, config.host, () => {
      logger.info({ port: config.port, host: config.host, env: config.env }, "API server is running");
    });

    setInterval(async () => {
      try {
        await cleanExpiredSeatLocks();
      } catch (err) {
        logger.error({ err }, "Seat lock cleaner error");
      }
    }, 15000);
  } else {
    logger.error("Unable to start server: listen is not available");
  }
}

bootstrap().catch((error) => {
  logger.error({ err: error }, "Failed to start API server");
  process.exit(1);
});
