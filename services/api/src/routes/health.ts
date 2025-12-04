import { Router } from "express";
import { AppConfig } from "../config/env";

export function createHealthRouter(config: AppConfig) {
  const router = Router();

  const basePayload = {
    service: config.serviceName,
    env: config.env,
  } as const;

  router.get("/health", (_req, res) => {
    res.json({ ...basePayload, status: "ok", uptimeMs: Math.round(process.uptime() * 1000) });
  });

  router.get("/readiness", (_req, res) => {
    res.json({ ...basePayload, status: "ready", timestamp: new Date().toISOString() });
  });

  return router;
}
