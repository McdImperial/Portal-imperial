import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { requireChatGPTUser } from "../../../../../app/chatgpt-auth";
import { ensureQslSchema } from "../../../../../db/qsl";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireChatGPTUser("/api/qsl/rounds");
    const roundId = parseInt(params.id);

    await ensureQslSchema();

    const round = await env.DB.prepare(
      "SELECT * FROM qsl_rounds WHERE id = ?"
    )
      .bind(roundId)
      .first();

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
      `SELECT c.*, p.code as point_code, p.name as point_name, a.name as area_name, a.color as area_color
       FROM qsl_checkpoints c
       LEFT JOIN qsl_points p ON c.qsl_point_id = p.id
       LEFT JOIN areas a ON p.area_id = a.id
       WHERE c.qsl_round_id = ?
       ORDER BY p.order_index`
    )
      .bind(roundId)
      .all();

    const completedCount = (checkpoints.results ?? []).filter(
      (c: any) => c.status === "completed"
    ).length;
    const totalCount = (checkpoints.results ?? []).length;

    return NextResponse.json({
      ...round,
      checkpoints: checkpoints.results ?? [],
      progress: {
        completed: completedCount,
        total: totalCount,
        percentage: totalCount ? Math.round((completedCount / totalCount) * 100) : 0,
      },
    });
  } catch (err) {
    console.error("QSL round fetch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireChatGPTUser("/api/qsl/rounds");
    const roundId = parseInt(params.id);
    const { status } = await request.json();

    if (!["pending", "em_curso", "concluida", "atrasada", "nao_realizada"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
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

    const now = new Date().toISOString();
    const startedAt = status === "em_curso" && !round.started_at ? now : round.started_at;
    const completedAt =
      status === "concluida" && !round.completed_at ? now : round.completed_at;

    await env.DB.prepare(
      `UPDATE qsl_rounds
       SET status = ?, started_at = ?, completed_at = ?, updated_at = ?
       WHERE id = ?`
    )
      .bind(status, startedAt, completedAt, now, roundId)
      .run();

    const updated = await env.DB.prepare(
      "SELECT * FROM qsl_rounds WHERE id = ?"
    )
      .bind(roundId)
      .first();

    return NextResponse.json(updated);
  } catch (err) {
    console.error("QSL round update error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
