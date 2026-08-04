import { importedMetrics } from "../db/imported-metrics";
import { importedRecords } from "../db/imported-records";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
}

let recordsReady = false;
let metricsReady = false;

async function ensureRecords(db: D1Database) {
  if (recordsReady) return;
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS health_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT, profile TEXT NOT NULL, kind TEXT NOT NULL,
      recorded_at TEXT NOT NULL, value_1 REAL, value_2 REAL, unit TEXT, title TEXT,
      notes TEXT, duration INTEGER, source_key TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_health_records_profile_date ON health_records(profile, recorded_at)"),
  ]);
  const columns = await db.prepare("PRAGMA table_info(health_records)").all<{ name: string }>();
  if (!columns.results.some((column) => column.name === "source_key")) {
    await db.prepare("ALTER TABLE health_records ADD COLUMN source_key TEXT").run();
  }
  await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_health_records_source_key ON health_records(source_key) WHERE source_key IS NOT NULL").run();
  const statements = importedRecords.map((record) => db.prepare(
    "INSERT OR IGNORE INTO health_records (profile, kind, recorded_at, value_1, value_2, unit, title, notes, duration, source_key) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  ).bind(record.profile, record.kind, record.recordedAt, record.value1, record.value2, record.unit, record.title, record.notes, record.duration, record.sourceKey));
  for (let index = 0; index < statements.length; index += 50) await db.batch(statements.slice(index, index + 50));
  recordsReady = true;
}

async function ensureMetrics(db: D1Database) {
  if (metricsReady) return;
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS health_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT, profile TEXT NOT NULL, group_name TEXT NOT NULL,
      metric_key TEXT NOT NULL, metric_label TEXT NOT NULL, recorded_at TEXT NOT NULL,
      value REAL NOT NULL, unit TEXT, source_key TEXT NOT NULL, source_url TEXT, note TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_health_metrics_source_key ON health_metrics(source_key)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_health_metrics_profile_group_metric_date ON health_metrics(profile, group_name, metric_key, recorded_at)"),
  ]);
  const statements = importedMetrics.map((item) => db.prepare(
    "INSERT OR IGNORE INTO health_metrics (profile, group_name, metric_key, metric_label, recorded_at, value, unit, source_key, source_url, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  ).bind(item.profile, item.groupName, item.metricKey, item.metricLabel, item.recordedAt, item.value, item.unit, item.sourceKey, item.sourceUrl, item.note));
  for (let index = 0; index < statements.length; index += 50) await db.batch(statements.slice(index, index + 50));
  metricsReady = true;
}

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});

async function recordsApi(request: Request, env: Env) {
  await ensureRecords(env.DB);
  if (request.method === "GET") {
    const result = await env.DB.prepare("SELECT id, profile, kind, recorded_at AS recordedAt, value_1 AS value1, value_2 AS value2, unit, title, notes, duration FROM health_records ORDER BY recorded_at DESC, id DESC").all();
    return json({ records: result.results });
  }
  if (request.method !== "POST") return json({ error: "Método não permitido" }, 405);
  const input = await request.json() as Record<string, unknown>;
  const profiles = new Set(["Tiago Soutelo", "Marlene Soutelo"]);
  const kinds = new Set(["weight", "blood_pressure", "activity", "medical"]);
  if (!profiles.has(String(input.profile)) || !kinds.has(String(input.kind)) || !/^\d{4}-\d{2}-\d{2}$/.test(String(input.recordedAt))) return json({ error: "Dados inválidos" }, 400);
  const numberOrNull = (value: unknown) => value === null || value === "" || value === undefined ? null : Number(value);
  const result = await env.DB.prepare("INSERT INTO health_records (profile, kind, recorded_at, value_1, value_2, unit, title, notes, duration) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(input.profile, input.kind, input.recordedAt, numberOrNull(input.value1), numberOrNull(input.value2), input.unit ?? null, String(input.title ?? "").slice(0, 120) || null, String(input.notes ?? "").slice(0, 1000) || null, numberOrNull(input.duration)).run();
  return json({ id: result.meta.last_row_id }, 201);
}

async function metricsApi(env: Env) {
  await ensureMetrics(env.DB);
  const result = await env.DB.prepare(`SELECT id, profile, group_name AS groupName, metric_key AS metricKey,
    metric_label AS metricLabel, recorded_at AS recordedAt, value, unit, source_url AS sourceUrl, note
    FROM health_metrics ORDER BY recorded_at, id`).all();
  return json({ metrics: result.results });
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      if (url.pathname === "/api/records") return await recordsApi(request, env);
      if (url.pathname === "/api/metrics") return await metricsApi(env);
      const response = await env.ASSETS.fetch(request);
      if (response.status !== 404) return response;
      return env.ASSETS.fetch(new Request(new URL("/", request.url), request));
    } catch {
      return json({ error: "Não foi possível concluir o pedido" }, 500);
    }
  },
};

export default worker;
