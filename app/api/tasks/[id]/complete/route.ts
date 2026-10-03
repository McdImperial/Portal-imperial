import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { requireChatGPTUser } from "../../../../../app/chatgpt-auth";
import { ensureShiftsSchema } from "../../../../../db/shifts";
import { ensureAuditSchema } from "../../../../../db/audit";

interface CompleteTaskRequest {
  status: "completed" | "non_conformance" | "na";
  value1?: string | number;
  value2?: string | number;
  notes?: string;
  photoUrl?: string;
  qrCodeData?: string;
}

interface CompleteTaskResponse {
  id: number;
  status: string;
  completedAt: string;
  occurrenceId?: number;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireChatGPTUser("/shifts");
    const taskExecutionId = parseInt(params.id, 10);
    const input = (await request.json()) as CompleteTaskRequest;

    if (!taskExecutionId) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    if (!input.status || !["completed", "non_conformance", "na"].includes(input.status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }

    await ensureShiftsSchema();
    await ensureAuditSchema();

    // Get task execution
    const task = await env.DB.prepare(
      `SELECT te.id, te.shift_id, te.task_template_id, te.status as old_status
       FROM task_executions te
       WHERE te.id = ?`
    )
      .bind(taskExecutionId)
      .first<{ id: number; shift_id: number; task_template_id: number; old_status: string }>();

    if (!task) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 });
    }

    // Verify shift ownership
    const shift = await env.DB.prepare("SELECT user_id FROM shifts WHERE id = ?")
      .bind(task.shift_id)
      .first<{ user_id: string }>();

    if (!shift || shift.user_id !== user.userId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const now = new Date().toISOString();

    // Update task execution
    await env.DB.prepare(
      `UPDATE task_executions
       SET status = ?, started_at = COALESCE(started_at, ?), completed_at = ?,
           value_1 = ?, value_2 = ?, notes = ?, photo_url = ?, qr_code_data = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
      .bind(
        input.status,
        now,
        input.status === "pending" ? null : now,
        input.value1 || null,
        input.value2 || null,
        input.notes || null,
        input.photoUrl || null,
        input.qrCodeData || null,
        taskExecutionId
      )
      .run();

    // Log audit
    await env.DB.prepare(
      `INSERT INTO audit_log (user_id, entity_type, entity_id, action, old_value, new_value)
       VALUES (?, 'task', ?, 'update', ?, ?)`
    )
      .bind(
        user.userId,
        taskExecutionId,
        JSON.stringify({ status: task.old_status }),
        JSON.stringify({ status: input.status })
      )
      .run();

    const response: CompleteTaskResponse = {
      id: taskExecutionId,
      status: input.status,
      completedAt: now,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error completing task:", error);
    return NextResponse.json({ error: "Erro ao completar tarefa" }, { status: 500 });
  }
}
