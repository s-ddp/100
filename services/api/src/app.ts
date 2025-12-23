import cors from "./vendor/cors.js";
import express from "./vendor/express.js";
import { AppConfig, loadConfig } from "./config/env.js";
import { createHealthRouter } from "./routes/health.js";
import { eventsRouter } from "./routes/events.js";
import { ordersRouter } from "./routes/orders.js";
import { tripsRouter } from "./routes/trips.js";
import { adminOrdersRouter } from "./routes/adminOrders.js";
import { paymentsRouter } from "./routes/payments.js";
import { adminRentRouter } from "./routes/adminRent.js";
import { publicRentRouter } from "./routes/publicRent.js";
import { errorHandler } from "./middleware/error-handler.js";
import seatmapRouter from "./modules/seatmap/seatmap.routes.js";
import { logger } from "./logger.js";
import { createSeatmapWSServer } from "./ws/seatmapServer.js";
import { registerSeatmapBroadcaster } from "./ws/seatmapHub.js";

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
  app.use("/admin/rent", adminRentRouter);
  app.use("/rent", publicRentRouter);

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
