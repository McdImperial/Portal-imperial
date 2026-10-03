import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { requireChatGPTUser } from "../../../../app/chatgpt-auth";
import { ensureQslSchema } from "../../../../db/qsl";

export async function GET(request: Request) {
  try {
    const user = await requireChatGPTUser("/api/qsl/schedule");
    const { searchParams } = new URL(request.url);
    const shiftId = searchParams.get("shiftId");

    if (!shiftId) {
      return NextResponse.json({ error: "shiftId required" }, { status: 400 });
    }

    await ensureQslSchema();

    const shift = await env.DB.prepare(
      "SELECT * FROM shifts WHERE id = ? AND user_id = ?"
    )
      .bind(shiftId, user.userId)
      .first<any>();

    if (!shift) {
      return NextResponse.json({ error: "Shift not found" }, { status: 404 });
    }

    const shiftType = await env.DB.prepare(
      "SELECT * FROM shift_types WHERE id = ?"
    )
      .bind(shift.shift_type_id)
      .first<any>();

    if (!shiftType) {
      return NextResponse.json({ error: "Shift type not found" }, { status: 404 });
    }

    const points = await env.DB.prepare(
      "SELECT * FROM qsl_points WHERE enabled = 1 ORDER BY order_index"
    ).all();

    const shiftStart = new Date(shift.started_at);
    const shiftEnd = new Date(shift.started_at);
    const [startHour, startMin] = shiftType.start_time.split(":").map(Number);
    const [endHour, endMin] = shiftType.end_time.split(":").map(Number);
    shiftEnd.setHours(endHour, endMin, 0, 0);

    const frequencyMinutes = shift.qsl_frequency_minutes || 60;
    const scheduledRounds = [];
    let currentTime = new Date(shiftStart);
    currentTime.setHours(startHour, startMin, 0, 0);

    while (currentTime <= shiftEnd) {
      scheduledRounds.push(new Date(currentTime));
      currentTime.setMinutes(currentTime.getMinutes() + frequencyMinutes);
    }

    const existingRounds = await env.DB.prepare(
      "SELECT * FROM qsl_rounds WHERE shift_id = ? ORDER BY round_number"
    )
      .bind(shiftId)
      .all();

    const schedule = scheduledRounds.map((time, index) => {
      const existing = (existingRounds.results ?? [])[index];
      return {
        roundNumber: index + 1,
        scheduledTime: time.toISOString(),
        status: existing?.status || "pending",
        roundId: existing?.id || null,
        points: (points.results ?? []).map((p: any) => ({
          id: p.id,
          code: p.code,
          name: p.name,
        })),
      };
    });

    return NextResponse.json({
      shift: {
        id: shift.id,
        shiftType: shiftType.name,
        startTime: shiftStart.toISOString(),
        endTime: shiftEnd.toISOString(),
        status: shift.status,
      },
      schedule,
      frequencyMinutes,
      totalExpectedRounds: scheduledRounds.length,
    });
  } catch (err) {
    console.error("QSL schedule error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
