import pino from "./vendor/pino.js";

const level = process.env.LOG_LEVEL || "info";

export const logger = pino({
  level,
  transport: process.env.NODE_ENV === "development" ? { target: "pino-pretty" } : undefined,
});
