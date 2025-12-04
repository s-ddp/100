import fs from 'node:fs';
import path from 'node:path';

function loadEnvFile(filePath = path.join(process.cwd(), '.env')) {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf8');
  content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .forEach((line) => {
      const [key, ...rest] = line.split('=');
      const value = rest.join('=');
      if (key && !(key in process.env)) {
        process.env[key] = value;
      }
    });
}

function parsePort(value, fallback) {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0 && parsed < 65536) return parsed;
  return fallback;
}

function parseVatRate(value, fallback) {
  if (!value) return fallback;
  if (typeof value === 'number') return value;
  const trimmed = value.trim();
  if (!trimmed) return fallback;

  if (trimmed.endsWith('%')) {
    const numeric = Number(trimmed.slice(0, -1));
    if (Number.isFinite(numeric) && numeric >= 0) return numeric / 100;
  }

  const numeric = Number(trimmed);
  if (Number.isFinite(numeric) && numeric >= 0 && numeric <= 1) return numeric;

  return fallback;
}

export function loadConfig() {
  loadEnvFile();

  return {
    env: process.env.NODE_ENV || 'development',
    host: process.env.HOST || '0.0.0.0',
    port: parsePort(process.env.PORT, 4000),
    serviceName: process.env.SERVICE_NAME || 'ticketing-api',
    logLevel: process.env.LOG_LEVEL || 'info',
    vatDefaultRate: parseVatRate(process.env.VAT_DEFAULT_RATE, 0.2),
    vatDefaultMode: process.env.VAT_DEFAULT_MODE || 'included',
    crmSlo: {
      p95Ms: Number(process.env.CRM_P95_MS) || 800,
      p99Ms: Number(process.env.CRM_P99_MS) || 1500,
    },
    supportSla: {
      firstResponseMinutes: Number(process.env.SUPPORT_FIRST_RESPONSE_MINUTES) || 15,
      resolutionMinutes: Number(process.env.SUPPORT_RESOLUTION_MINUTES) || 240,
    },
  };
}
