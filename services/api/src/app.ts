import cors from "./vendor/cors";
import express from "./vendor/express";
import { AppConfig } from "./config/env";
import { createHealthRouter } from "./routes/health";
import { eventsRouter } from "./routes/events";
import { ordersRouter } from "./routes/orders";
import { errorHandler } from "./middleware/error-handler";

export function createApp(config: AppConfig) {
  const app = express();

  app.use(express.json());
  app.use(cors());

  app.use(createHealthRouter(config));
  app.get("/status", (_req: any, res: any) => {
    res.json({ service: config.serviceName, env: config.env, status: "ok" });
  });

  app.use("/events", eventsRouter);
  app.use("/orders", ordersRouter);

  app.use(errorHandler);

  return app;
}
