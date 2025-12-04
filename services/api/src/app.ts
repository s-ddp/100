import cors from "./vendor/cors.js";
import express from "./vendor/express.js";
import { AppConfig } from "./config/env.js";
import { createHealthRouter } from "./routes/health.js";
import { eventsRouter } from "./routes/events.js";
import { ordersRouter } from "./routes/orders.js";
import { errorHandler } from "./middleware/error-handler.js";

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
