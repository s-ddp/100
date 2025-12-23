import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");

export function readJson<T>(filename: string, fallback: T): T {
  try {
    const full = path.join(dataDir, filename);
    if (!fs.existsSync(full)) return fallback;
    const raw = fs.readFileSync(full, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(filename: string, data: T): void {
  const full = path.join(dataDir, filename);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(data, null, 2), "utf-8");
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}
