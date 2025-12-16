import { startApp } from "./app.js";
import { logger } from "./logger.js";

async function bootstrap() {
  await startApp();
}

bootstrap().catch((error) => {
  logger.error({ err: error }, "Failed to start API server");
  process.exit(1);
});
