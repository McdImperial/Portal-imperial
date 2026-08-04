import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { ensureMetricsSchema } from "../../../db/metrics";

export async function GET() {
  try {
    await ensureMetricsSchema();
    const result = await env.DB.prepare(`SELECT id, profile, group_name AS groupName, metric_key AS metricKey,
      metric_label AS metricLabel, recorded_at AS recordedAt, value, unit, source_url AS sourceUrl, note
      FROM health_metrics ORDER BY recorded_at, id`).all();
    return NextResponse.json({ metrics: result.results });
  } catch {
    return NextResponse.json({ metrics: [] });
  }
}
