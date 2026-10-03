import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { requireChatGPTUser } from "../../../app/chatgpt-auth";
import { ensureShiftsSchema } from "../../../db/shifts";

interface TaskItem {
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
  requiresPhoto: number;
  requiresQrCode: number;
  templateId: number;
  assignedRole?: string;
}

interface TasksListResponse {
  tasks: TaskItem[];
  summary: {
    completed: number;
    total: number;
    overdue: number;
  };
}

export async function GET(request: Request) {
  try {
    const user = await requireChatGPTUser("/shifts");

    const url = new URL(request.url);
    const shiftId = url.searchParams.get("shiftId");

    if (!shiftId || isNaN(parseInt(shiftId, 10))) {
      return NextResponse.json({ error: "shiftId inválido" }, { status: 400 });
    }

    await ensureShiftsSchema();

    // Verify ownership
    const shift = await env.DB.prepare(
      "SELECT id FROM shifts WHERE id = ? AND user_id = ?"
    )
      .bind(parseInt(shiftId, 10), user.userId)
      .first<{ id: number }>();

    if (!shift) {
      return NextResponse.json({ error: "Turno não encontrado" }, { status: 404 });
    }

    // Fetch tasks
    const tasks = await env.DB.prepare(
      `SELECT
        te.id,
        tt.id as template_id,
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
        tt.photo_required,
        tt.qr_code_required,
        tt.assigned_role,
        tt.order_index
       FROM task_executions te
       JOIN task_templates tt ON te.task_template_id = tt.id
       JOIN areas a ON tt.area_id = a.id
       WHERE te.shift_id = ?
       ORDER BY tt.order_index ASC`
    )
      .bind(parseInt(shiftId, 10))
      .all<TaskItem & {
        template_id: number;
        order_index: number;
        photo_required: number;
        qr_code_required: number;
        assigned_role?: string;
      }>();

    const taskList = tasks.results || [];
    const completed = taskList.filter((t) => t.status === "completed" || t.status === "na").length;
    const total = taskList.length;

    // Check for overdue tasks (simplified)
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, "0") + ":" +
                        now.getMinutes().toString().padStart(2, "0");
    const overdue = taskList.filter((t) => {
      if (t.status !== "pending") return false;
      if (!t.deadline_time) return false;
      return t.deadline_time < currentTime;
    }).length;

    const formattedTasks: TaskItem[] = taskList.map((t) => ({
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
      requiresPhoto: t.photo_required,
      requiresQrCode: t.qr_code_required,
      templateId: t.template_id,
      assignedRole: t.assigned_role,
    }));

    const response: TasksListResponse = {
      tasks: formattedTasks,
      summary: {
        completed,
        total,
        overdue,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Erro ao buscar tarefas" }, { status: 500 });
  }
}
