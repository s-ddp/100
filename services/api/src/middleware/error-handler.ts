import { logger } from "../logger";

export function errorHandler(err: any, _req: any, res: any, _next: any) {
  logger.error({ err });
  res.status(500).json({ error: "Internal server error" });
}
