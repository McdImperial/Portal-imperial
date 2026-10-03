import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { requireChatGPTUser } from "../../../../../app/chatgpt-auth";
import { ensureShiftsSchema } from "../../../../../db/shifts";
import { ensureAuditSchema } from "../../../../../db/audit";

interface EndShiftResponse {
  id: number;
  endedAt: string;
  status: string;
  taskSummary: {
    completed: number;
    total: number;
  };
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireChatGPTUser("/shifts");
    const shiftId = parseInt(params.id, 10);

    if (!shiftId) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    await ensureShiftsSchema();
    await ensureAuditSchema();

    // Verify ownership and get shift
    const shift = await env.DB.prepare(
      "SELECT id, status FROM shifts WHERE id = ? AND user_id = ?"
    )
      .bind(shiftId, user.userId)
      .first<{ id: number; status: string }>();

    if (!shift) {
      return NextResponse.json({ error: "Turno não encontrado" }, { status: 404 });
    }

    if (shift.status !== "active") {
      return NextResponse.json(
        { error: "Turno não está ativo" },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();

    // Update shift status to closed
    await env.DB.prepare(
      "UPDATE shifts SET status = 'closed', ended_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    )
      .bind(now, shiftId)
      .run();

    // Get task summary
    const summary = await env.DB.prepare(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status IN ('completed', 'na') THEN 1 ELSE 0 END) as completed
       FROM task_executions
       WHERE shift_id = ?`
    )
      .bind(shiftId)
      .first<{ total: number; completed: number }>();

    // Log audit entry
    await env.DB.prepare(
      `INSERT INTO audit_log (user_id, entity_type, entity_id, action, new_value)
       VALUES (?, 'shift', ?, 'update', ?)`
    )
      .bind(user.userId, shiftId, JSON.stringify({ status: "closed", endedAt: now }))
      .run();

    const response: EndShiftResponse = {
      id: shiftId,
      endedAt: now,
      status: "closed",
      taskSummary: {
        completed: summary?.completed || 0,
        total: summary?.total || 0,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error ending shift:", error);
    return NextResponse.json({ error: "Erro ao finalizar turno" }, { status: 500 });
  }
}
