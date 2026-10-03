import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { requireChatGPTUser } from "../../../../app/chatgpt-auth";
import { ensureQslSchema } from "../../../../db/qsl";

interface CreateRoundRequest {
  shiftId: number;
}

export async function POST(request: Request) {
  try {
    const user = await requireChatGPTUser("/api/qsl/rounds");
    const input = (await request.json()) as CreateRoundRequest;
    const { shiftId } = input;

    if (!shiftId) {
      return NextResponse.json({ error: "shiftId required" }, { status: 400 });
    }

    await ensureQslSchema();

    const shift = await env.DB.prepare(
      "SELECT id FROM shifts WHERE id = ? AND user_id = ?"
    )
      .bind(shiftId, user.userId)
      .first<{ id: number }>();

    if (!shift) {
      return NextResponse.json({ error: "Shift not found" }, { status: 404 });
    }

    const now = new Date().toISOString();
    const roundCount = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM qsl_rounds WHERE shift_id = ?"
    )
      .bind(shiftId)
      .first<{ count: number }>();

    const roundNumber = (roundCount?.count ?? 0) + 1;

    const result = await env.DB.prepare(
      `INSERT INTO qsl_rounds (shift_id, round_number, scheduled_time, status)
       VALUES (?, ?, ?, 'pending')`
    ).bind(shiftId, roundNumber, now).run();

    const newRound = await env.DB.prepare(
      "SELECT * FROM qsl_rounds WHERE id = ?"
    )
      .bind(result.meta.last_row_id)
      .first();

    return NextResponse.json(newRound, { status: 201 });
  } catch (err) {
    console.error("QSL round creation error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const user = await requireChatGPTUser("/api/qsl/rounds");
    const { searchParams } = new URL(request.url);
    const shiftId = searchParams.get("shiftId");

    if (!shiftId) {
      return NextResponse.json({ error: "shiftId required" }, { status: 400 });
    }

    await ensureQslSchema();

    const shift = await env.DB.prepare(
      "SELECT id FROM shifts WHERE id = ? AND user_id = ?"
    )
      .bind(shiftId, user.userId)
      .first<{ id: number }>();

    if (!shift) {
      return NextResponse.json({ error: "Shift not found" }, { status: 404 });
    }

    const rounds = await env.DB.prepare(
      "SELECT * FROM qsl_rounds WHERE shift_id = ? ORDER BY round_number"
    )
      .bind(shiftId)
      .all();

    const roundsWithCheckpoints = await Promise.all(
      (rounds.results ?? []).map(async (round: any) => {
        const checkpoints = await env.DB.prepare(
          "SELECT * FROM qsl_checkpoints WHERE qsl_round_id = ?"
        )
          .bind(round.id)
          .all();

        return {
          ...round,
          checkpoints: checkpoints.results ?? [],
          completedCheckpoints: (checkpoints.results ?? []).filter(
            (c: any) => c.status === "completed"
          ).length,
          totalCheckpoints: (checkpoints.results ?? []).length,
        };
      })
    );

    return NextResponse.json(roundsWithCheckpoints);
  } catch (err) {
    console.error("QSL rounds fetch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
