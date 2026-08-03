import { env } from "cloudflare:workers";
import { importedRecords } from "./imported-records";

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
      source_key TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_health_records_profile_date ON health_records(profile, recorded_at)"),
  ]);
  const columns = await env.DB.prepare("PRAGMA table_info(health_records)").all<{ name: string }>();
  if (!columns.results.some((column) => column.name === "source_key")) {
    await env.DB.prepare("ALTER TABLE health_records ADD COLUMN source_key TEXT").run();
  }
  await env.DB.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_health_records_source_key ON health_records(source_key) WHERE source_key IS NOT NULL").run();
  const statements = importedRecords.map((record) => env.DB.prepare(
    "INSERT OR IGNORE INTO health_records (profile, kind, recorded_at, value_1, value_2, unit, title, notes, duration, source_key) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  ).bind(record.profile, record.kind, record.recordedAt, record.value1, record.value2, record.unit, record.title, record.notes, record.duration, record.sourceKey));
  for (let index = 0; index < statements.length; index += 50) {
    await env.DB.batch(statements.slice(index, index + 50));
  }
  await env.DB.prepare("PRAGMA optimize").run();
  initialized = true;
}
