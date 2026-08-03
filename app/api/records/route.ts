import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { ensureRecordsSchema } from "../../../db/records";

type Input = { profile?: string; kind?: string; recordedAt?: string; value1?: string | number | null; value2?: string | number | null; unit?: string | null; title?: string | null; notes?: string | null; duration?: string | number | null };
const allowedProfiles = new Set(["Tiago Soutelo", "Marlene Soutelo"]);
const allowedKinds = new Set(["weight", "blood_pressure", "activity", "medical"]);

export async function GET() {
  try {
    await ensureRecordsSchema();
    const result = await env.DB.prepare("SELECT id, profile, kind, recorded_at AS recordedAt, value_1 AS value1, value_2 AS value2, unit, title, notes, duration FROM health_records ORDER BY recorded_at DESC, id DESC").all();
    return NextResponse.json({ records: result.results });
  } catch {
    return NextResponse.json({ records: [] });
  }
}

export async function POST(request: Request) {
  try {
    const input = await request.json() as Input;
    if (!input.profile || !allowedProfiles.has(input.profile) || !input.kind || !allowedKinds.has(input.kind) || !input.recordedAt || !/^\d{4}-\d{2}-\d{2}$/.test(input.recordedAt)) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    await ensureRecordsSchema();
    const result = await env.DB.prepare("INSERT INTO health_records (profile, kind, recorded_at, value_1, value_2, unit, title, notes, duration) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(input.profile, input.kind, input.recordedAt, input.value1 === null || input.value1 === "" || input.value1 === undefined ? null : Number(input.value1), input.value2 === null || input.value2 === "" || input.value2 === undefined ? null : Number(input.value2), input.unit ?? null, input.title?.slice(0, 120) ?? null, input.notes?.slice(0, 1000) ?? null, input.duration === null || input.duration === "" || input.duration === undefined ? null : Number(input.duration)).run();
    return NextResponse.json({ id: result.meta.last_row_id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Não foi possível guardar" }, { status: 500 });
  }
}
