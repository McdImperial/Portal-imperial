import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { requireChatGPTUser } from "../../../../app/chatgpt-auth";
import { ensureShiftsSchema } from "../../../../db/shifts";

interface TaskWithExecution {
  id: number;
  name: string;
  area: string;
  status: string;
  scheduledTime?: string;
  deadlineTime?: string;
  criticality: string;
  responseType: string;
  startedAt?: string;
  completedAt?: string;
  value1?: string;
  value2?: string;
  notes?: string;
  allowNa: number;
}

interface ShiftDetailResponse {
  id: number;
  shiftTypeId: number;
  shiftTypeName: string;
  shiftDate: string;
  startedAt: string;
  endedAt?: string;
  status: string;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  tasks: TaskWithExecution[];
  nonConformances: {
    open: number;
    pending: number;
  };
}

export async function GET(
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

    // Fetch shift
    const shift = await env.DB.prepare(
      `SELECT s.*, st.name as shift_type_name
       FROM shifts s
       JOIN shift_types st ON s.shift_type_id = st.id
       WHERE s.id = ? AND s.user_id = ?`
    )
      .bind(shiftId, user.userId)
      .first<{
        id: number;
        shift_type_id: number;
        shift_type_name: string;
        shift_date: string;
        started_at: string;
        ended_at?: string;
        status: string;
      }>();

    if (!shift) {
      return NextResponse.json({ error: "Turno não encontrado" }, { status: 404 });
    }

    // Fetch tasks with executions
    const tasks = await env.DB.prepare(
      `SELECT
        te.id,
        tt.name,
        a.name as area,
        te.status,
        tt.scheduled_time,
        tt.deadline_time,
        tt.criticality,
        tt.response_type,
        te.started_at,
        te.completed_at,
        te.value_1,
        te.value_2,
        te.notes,
        tt.allow_na,
        tt.order_index
       FROM task_executions te
       JOIN task_templates tt ON te.task_template_id = tt.id
       JOIN areas a ON tt.area_id = a.id
       WHERE te.shift_id = ?
       ORDER BY tt.order_index ASC`
    )
      .bind(shiftId)
      .all<TaskWithExecution & { order_index: number }>();

    // Calculate progress
    const taskList = tasks.results || [];
    const completed = taskList.filter((t) => t.status === "completed" || t.status === "na").length;
    const total = taskList.length;

    const response: ShiftDetailResponse = {
      id: shift.id,
      shiftTypeId: shift.shift_type_id,
      shiftTypeName: shift.shift_type_name,
      shiftDate: shift.shift_date,
      startedAt: shift.started_at,
      endedAt: shift.ended_at,
      status: shift.status,
      progress: {
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      },
      tasks: taskList.map((t) => ({
        id: t.id,
        name: t.name,
        area: t.area,
        status: t.status,
        scheduledTime: t.scheduled_time,
        deadlineTime: t.deadline_time,
        criticality: t.criticality,
        responseType: t.response_type,
        startedAt: t.started_at,
        completedAt: t.completed_at,
        value1: t.value_1,
        value2: t.value_2,
        notes: t.notes,
        allowNa: t.allow_na,
      })),
      nonConformances: {
        open: 0,
        pending: 0,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching shift details:", error);
    return NextResponse.json({ error: "Erro ao buscar turno" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireChatGPTUser("/shifts");
    const shiftId = parseInt(params.id, 10);
    const input = (await request.json()) as { notes?: string };

    if (!shiftId) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    await ensureShiftsSchema();

    // Verify ownership
    const shift = await env.DB.prepare("SELECT id FROM shifts WHERE id = ? AND user_id = ?")
      .bind(shiftId, user.userId)
      .first<{ id: number }>();

    if (!shift) {
      return NextResponse.json({ error: "Turno não encontrado" }, { status: 404 });
    }

    // Update
    const result = await env.DB.prepare(
      "UPDATE shifts SET notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    )
      .bind(input.notes || null, shiftId)
      .run();

    return NextResponse.json({
      id: shiftId,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating shift:", error);
    return NextResponse.json({ error: "Erro ao atualizar turno" }, { status: 500 });
  }
}
