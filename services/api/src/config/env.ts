import dotenv from "dotenv";

dotenv.config();

export interface AppConfig {
  env: string;
  host: string;
  port: number;
  serviceName: string;
}

function parsePort(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0 && parsed < 65536) {
    return parsed;
  }

  return fallback;
}

export function loadConfig(): AppConfig {
  const env = process.env.NODE_ENV || "development";
  const host = process.env.HOST || "0.0.0.0";
  const port = parsePort(process.env.PORT, 4000);
  const serviceName = process.env.SERVICE_NAME || "ticketing-api";

  return { env, host, port, serviceName };
}
