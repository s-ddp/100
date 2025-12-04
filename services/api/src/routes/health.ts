import { Router } from "../vendor/express";
import { AppConfig } from "../config/env";

export function createHealthRouter(config: AppConfig) {
  const router = Router();
  const basePayload = { service: config.serviceName, env: config.env };

  router.get("/health", (_req: any, res: any) => {
    res.json({ ...basePayload, status: "ok", uptimeMs: Math.round(process.uptime() * 1000) });
  });

  router.get("/ready", (_req, res) => {
    res.json({ ...basePayload, status: "ready", timestamp: new Date().toISOString() });
  });

  return router;
}
