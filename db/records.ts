import { env } from "cloudflare:workers";

let initialized = false;

export async function ensureRecordsSchema() {
  if (initialized) return;
  if (!env.DB) throw new Error("Database unavailable");
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS health_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile TEXT NOT NULL,
      kind TEXT NOT NULL,
      recorded_at TEXT NOT NULL,
      value_1 REAL,
      value_2 REAL,
      unit TEXT,
      title TEXT,
      notes TEXT,
      duration INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_health_records_profile_date ON health_records(profile, recorded_at)"),
  ]);
  initialized = true;
}
