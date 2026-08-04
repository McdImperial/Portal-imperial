import { env } from "cloudflare:workers";
import { importedMetrics } from "./imported-metrics";

let initialized = false;

export async function ensureMetricsSchema() {
  if (initialized) return;
  if (!env.DB) throw new Error("Database unavailable");
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS health_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile TEXT NOT NULL,
      group_name TEXT NOT NULL,
      metric_key TEXT NOT NULL,
      metric_label TEXT NOT NULL,
      recorded_at TEXT NOT NULL,
      value REAL NOT NULL,
      unit TEXT,
      source_key TEXT NOT NULL,
      source_url TEXT,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    env.DB.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_health_metrics_source_key ON health_metrics(source_key)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_health_metrics_profile_group_metric_date ON health_metrics(profile, group_name, metric_key, recorded_at)"),
  ]);
  const statements = importedMetrics.map((item) => env.DB.prepare(
    "INSERT OR IGNORE INTO health_metrics (profile, group_name, metric_key, metric_label, recorded_at, value, unit, source_key, source_url, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  ).bind(item.profile, item.groupName, item.metricKey, item.metricLabel, item.recordedAt, item.value, item.unit, item.sourceKey, item.sourceUrl, item.note));
  for (let index = 0; index < statements.length; index += 50) {
    await env.DB.batch(statements.slice(index, index + 50));
  }
  await env.DB.prepare("PRAGMA optimize").run();
  initialized = true;
}
