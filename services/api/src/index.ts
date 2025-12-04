import { createApp } from "./app";
import { loadConfig } from "./config/env";
import { logger } from "./logger";

async function bootstrap() {
  const config = loadConfig();
  const app = createApp(config);

  app.listen(config.port, config.host, () => {
    logger.info({ port: config.port, host: config.host, env: config.env }, "API server is running");
  });
}

bootstrap().catch((error) => {
  logger.error({ err: error }, "Failed to start API server");
  process.exit(1);
});
