import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { requireChatGPTUser } from "../../../../app/chatgpt-auth";
import { ensureShiftsSchema } from "../../../../db/shifts";

interface AdminTaskResponse {
  id: number;
  name: string;
  area: string;
  shiftType: string;
  scheduledTime?: string;
  deadlineTime?: string;
  criticality: string;
  responseType: string;
  photoRequired: number;
  qrCodeRequired: number;
  allowNa: number;
  enabled: number;
}

export async function GET() {
  try {
    await requireChatGPTUser("/admin");
    await ensureShiftsSchema();

    const tasks = await env.DB.prepare(
      `SELECT
        tt.id,
        tt.name,
        a.name as area,
        st.name as shift_type,
        tt.scheduled_time,
        tt.deadline_time,
        tt.criticality,
        tt.response_type,
        tt.photo_required,
        tt.qr_code_required,
        tt.allow_na,
        tt.enabled
       FROM task_templates tt
       JOIN areas a ON tt.area_id = a.id
       JOIN shift_types st ON tt.shift_type_id = st.id
       ORDER BY st.id, tt.order_index ASC`
    )
      .all<AdminTaskResponse & { shift_type: string }>();

    const formattedTasks = (tasks.results || []).map((t) => ({
      id: t.id,
      name: t.name,
      area: t.area,
      shiftType: t.shift_type,
      scheduledTime: t.scheduled_time,
      deadlineTime: t.deadline_time,
      criticality: t.criticality,
      responseType: t.response_type,
      photoRequired: t.photo_required,
      qrCodeRequired: t.qr_code_required,
      allowNa: t.allow_na,
      enabled: t.enabled,
    }));

    return NextResponse.json({ tasks: formattedTasks });
  } catch (error) {
    console.error("Error fetching admin tasks:", error);
    return NextResponse.json({ error: "Erro ao buscar tarefas", tasks: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireChatGPTUser("/admin");
    await ensureShiftsSchema();

    const input = await request.json();

    // Validate required fields
    if (!input.name || !input.shiftTypeId || !input.areaId) {
      return NextResponse.json({ error: "Campos obrigatórios faltam" }, { status: 400 });
    }

    const result = await env.DB.prepare(
      `INSERT INTO task_templates
       (name, description, shift_type_id, area_id, order_index, scheduled_time, deadline_time,
        criticality, response_type, photo_required, qr_code_required, allow_na, enabled)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
        1
      )
      .run();

    return NextResponse.json(
      { id: result.meta.last_row_id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Erro ao criar tarefa" }, { status: 500 });
  }
}
