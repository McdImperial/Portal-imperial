import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { requireChatGPTUser } from "../../../../../app/chatgpt-auth";
import { ensureShiftsSchema } from "../../../../../db/shifts";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireChatGPTUser("/admin");
    await ensureShiftsSchema();

    const taskId = parseInt(params.id, 10);
    if (!taskId) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    const task = await env.DB.prepare(
      `SELECT
        tt.id, tt.name, tt.description, tt.shift_type_id, tt.area_id,
        tt.order_index, tt.scheduled_time, tt.deadline_time, tt.criticality,
        tt.response_type, tt.photo_required, tt.qr_code_required, tt.allow_na, tt.enabled
       FROM task_templates tt
       WHERE tt.id = ?`
    )
      .bind(taskId)
      .first();

    if (!task) return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json({ error: "Erro ao buscar tarefa" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireChatGPTUser("/admin");
    await ensureShiftsSchema();

    const taskId = parseInt(params.id, 10);
    if (!taskId) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    const input = await request.json();

    await env.DB.prepare(
      `UPDATE task_templates
       SET name = ?, description = ?, shift_type_id = ?, area_id = ?, order_index = ?,
           scheduled_time = ?, deadline_time = ?, criticality = ?, response_type = ?,
           photo_required = ?, qr_code_required = ?, allow_na = ?, enabled = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
      .bind(
        input.name,
        input.description || null,
        input.shiftTypeId,
        input.areaId,
        input.orderIndex || null,
        input.scheduledTime || null,
        input.deadlineTime || null,
        input.criticality || "normal",
        input.responseType || "yes_no",
        input.photoRequired ? 1 : 0,
        input.qrCodeRequired ? 1 : 0,
        input.allowNa ? 1 : 0,
        input.enabled ? 1 : 0,
        taskId
      )
      .run();

    return NextResponse.json({ id: taskId, updated: true });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Erro ao atualizar tarefa" }, { status: 500 });
  }
}
