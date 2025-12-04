import cors from "cors";
import express from "express";
import { AppConfig } from "./config/env";
import { createHealthRouter } from "./routes/health";
import { errorHandler } from "./middleware/error-handler";

export function createApp(config: AppConfig) {
  const app = express();

  app.use(express.json());
  app.use(cors());

  app.use(createHealthRouter(config));

  app.use(errorHandler);

  return app;
}
