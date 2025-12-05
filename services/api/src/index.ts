import { createApp } from "./app";
import { loadConfig } from "./config/env";
import { logger } from "./logger";
import { startSeatLockCleaner } from "./workers/seatLockCleaner";
import { registerSeatmapBroadcaster } from "./ws/seatmapHub";
import { createSeatmapWSServer } from "./ws/seatmapServer";

async function bootstrap() {
  const config = loadConfig();
  const app = createApp(config);

  if (app.listen) {
    const server = app.listen(config.port, config.host, () => {
      logger.info({ port: config.port, host: config.host, env: config.env }, "API server is running");
    });

    const wsServer = createSeatmapWSServer(server);
    registerSeatmapBroadcaster(wsServer.broadcastSeatChange);

    startSeatLockCleaner(15000);
  } else {
    logger.error("Unable to start server: listen is not available");
  }
}

bootstrap().catch((error) => {
  logger.error({ err: error }, "Failed to start API server");
  process.exit(1);
});
