import cors from "./vendor/cors";
import express from "./vendor/express";
import { AppConfig, loadConfig } from "./config/env";
import { createHealthRouter } from "./routes/health";
import { eventsRouter } from "./routes/events";
import { ordersRouter } from "./routes/orders";
import { tripsRouter } from "./routes/trips";
import { adminOrdersRouter } from "./routes/adminOrders";
import { paymentsRouter } from "./routes/payments";
import { errorHandler } from "./middleware/error-handler";
import seatmapRouter from "./modules/seatmap/seatmap.routes";
import { logger } from "./logger";
import { createSeatmapWSServer } from "./ws/seatmapServer";
import { registerSeatmapBroadcaster } from "./ws/seatmapHub";

export function createApp(config: AppConfig) {
  const app = express();

  app.use(express.json());
  app.use(cors());

  app.use(createHealthRouter(config));
  app.get("/status", (_req: any, res: any) => {
    res.json({ service: config.serviceName, env: config.env, status: "ok" });
  });

  app.use("/api", seatmapRouter);
  app.use("/events", eventsRouter);
  app.use("/orders", ordersRouter);
  app.use("/trips", tripsRouter);
  app.use("/admin/orders", adminOrdersRouter);
  app.use("/payments", paymentsRouter);

  app.use(errorHandler);

  return app;
}

export async function startApp() {
  const config = loadConfig();
  const app = createApp(config);

  if (!app.listen) {
    logger.error("Unable to start server: listen is not available");
    return;
  }

  const server = app.listen(config.port, config.host, () => {
    logger.info({ port: config.port, host: config.host, env: config.env }, "API server is running");
  });

  const wsServer = createSeatmapWSServer(server);
  registerSeatmapBroadcaster(wsServer.broadcastSeatChange);

  return server;
}
