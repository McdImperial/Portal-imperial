import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { requireChatGPTUser } from "../../../../app/chatgpt-auth";
import { ensureQslSchema } from "../../../../db/qsl";

interface CheckpointRequest {
  roundId: number;
  qslPointId: number;
  qrCodeData?: string;
  photoUrl?: string;
  notes?: string;
  issues?: string;
}

export async function POST(request: Request) {
  try {
    const user = await requireChatGPTUser("/api/qsl/checkpoints");
    const input = (await request.json()) as CheckpointRequest;
    const { roundId, qslPointId, qrCodeData, photoUrl, notes, issues } = input;

    if (!roundId || !qslPointId) {
      return NextResponse.json(
        { error: "roundId and qslPointId required" },
        { status: 400 }
      );
    }

    await ensureQslSchema();

    const round = await env.DB.prepare(
      "SELECT * FROM qsl_rounds WHERE id = ?"
    )
      .bind(roundId)
      .first<any>();

    if (!round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    const shift = await env.DB.prepare(
      "SELECT id FROM shifts WHERE id = ? AND user_id = ?"
    )
      .bind(round.shift_id, user.userId)
      .first<{ id: number }>();

    if (!shift) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const point = await env.DB.prepare(
      "SELECT * FROM qsl_points WHERE id = ?"
    )
      .bind(qslPointId)
      .first<any>();

    if (!point) {
      return NextResponse.json({ error: "QSL point not found" }, { status: 404 });
    }

    if (qrCodeData && point.qr_code_data && qrCodeData !== point.qr_code_data) {
      return NextResponse.json(
        { error: "QR code does not match point" },
        { status: 400 }
      );
    }

    const existing = await env.DB.prepare(
      "SELECT * FROM qsl_checkpoints WHERE qsl_round_id = ? AND qsl_point_id = ?"
    )
      .bind(roundId, qslPointId)
      .first<any>();

    const now = new Date().toISOString();

    if (existing) {
      await env.DB.prepare(
        `UPDATE qsl_checkpoints
         SET status = ?, scanned_at = ?, photo_url = ?, notes = ?, issues = ?, updated_at = ?
         WHERE id = ?`
      )
        .bind(
          "completed",
          now,
          photoUrl || existing.photo_url,
          notes || existing.notes,
          issues || existing.issues,
          now,
          existing.id
        )
        .run();

      const updated = await env.DB.prepare(
        "SELECT * FROM qsl_checkpoints WHERE id = ?"
      )
        .bind(existing.id)
        .first();

      return NextResponse.json(updated);
    }

    const result = await env.DB.prepare(
      `INSERT INTO qsl_checkpoints (qsl_round_id, qsl_point_id, status, scanned_at, photo_url, notes, issues)
       VALUES (?, ?, 'completed', ?, ?, ?, ?)`
    )
      .bind(roundId, qslPointId, now, photoUrl || null, notes || null, issues || null)
      .run();

    const newCheckpoint = await env.DB.prepare(
      "SELECT * FROM qsl_checkpoints WHERE id = ?"
    )
      .bind(result.meta.last_row_id)
      .first();

    return NextResponse.json(newCheckpoint, { status: 201 });
  } catch (err) {
    console.error("QSL checkpoint creation error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const user = await requireChatGPTUser("/api/qsl/checkpoints");
    const { searchParams } = new URL(request.url);
    const roundId = searchParams.get("roundId");

    if (!roundId) {
      return NextResponse.json({ error: "roundId required" }, { status: 400 });
    }

    await ensureQslSchema();

    const round = await env.DB.prepare(
      "SELECT * FROM qsl_rounds WHERE id = ?"
    )
      .bind(roundId)
      .first<any>();

    if (!round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    const shift = await env.DB.prepare(
      "SELECT id FROM shifts WHERE id = ? AND user_id = ?"
    )
      .bind(round.shift_id, user.userId)
      .first<{ id: number }>();

    if (!shift) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const checkpoints = await env.DB.prepare(
      "SELECT * FROM qsl_checkpoints WHERE qsl_round_id = ? ORDER BY created_at"
    )
      .bind(roundId)
      .all();

    return NextResponse.json(checkpoints.results ?? []);
  } catch (err) {
    console.error("QSL checkpoints fetch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
