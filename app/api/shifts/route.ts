import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { requireChatGPTUser } from "../../../app/chatgpt-auth";
import { ensureShiftsSchema } from "../../../db/shifts";
import { ensureAuditSchema } from "../../../db/audit";

interface StartShiftRequest {
  shiftTypeId: number;
  notes?: string;
}

interface ShiftResponse {
  id: number;
  status: string;
  startedAt: string;
  shiftTypeId: number;
  shiftDate: string;
}

export async function POST(request: Request) {
  try {
    const user = await requireChatGPTUser("/shifts");
    const input = (await request.json()) as StartShiftRequest;

    if (!input.shiftTypeId || typeof input.shiftTypeId !== "number") {
      return NextResponse.json({ error: "shiftTypeId inválido" }, { status: 400 });
    }

    await ensureShiftsSchema();
    await ensureAuditSchema();

    // Validate shift type exists
    const shiftType = await env.DB.prepare(
      "SELECT id, code FROM shift_types WHERE id = ? AND enabled = 1"
    )
      .bind(input.shiftTypeId)
      .first<{ id: number; code: string }>();

    if (!shiftType) {
      return NextResponse.json({ error: "Tipo de turno não encontrado" }, { status: 404 });
    }

    // Check if user already has an active shift today
    const today = new Date().toISOString().split("T")[0];
    const existingShift = await env.DB.prepare(
      "SELECT id FROM shifts WHERE user_id = ? AND shift_date = ? AND status = 'active'"
    )
      .bind(user.userId, today)
      .first<{ id: number }>();

    if (existingShift) {
      return NextResponse.json(
        { error: "Já existe um turno ativo para hoje" },
        { status: 409 }
      );
    }

    // Get shift configuration (start time, expected rounds, etc)
    const shiftConfig = await env.DB.prepare(
      "SELECT start_time, qsl_frequency_minutes FROM shift_types WHERE id = ?"
    )
      .bind(input.shiftTypeId)
      .first<{ start_time: string; qsl_frequency_minutes: number }>();

    // Calculate expected QSL rounds
    let expectedQslRounds = 0;
    let qslFrequencyMinutes = 60;
    if (shiftConfig) {
      qslFrequencyMinutes = shiftConfig.qsl_frequency_minutes || 60;
      // Simplified: assume 6 hours for abertura, 2 for fecho
      expectedQslRounds = input.shiftTypeId === 1 ? 6 : input.shiftTypeId === 3 ? 2 : 5;
    }

    const now = new Date().toISOString();

    // Create shift
    const result = await env.DB.prepare(
      `INSERT INTO shifts (user_id, shift_type_id, shift_date, started_at, status,
       expected_qsl_rounds, qsl_frequency_minutes, notes)
       VALUES (?, ?, ?, ?, 'active', ?, ?, ?)`
    )
      .bind(user.userId, input.shiftTypeId, today, now, expectedQslRounds, qslFrequencyMinutes, input.notes || null)
      .run();

    const shiftId = result.meta.last_row_id as number;

    // Log audit entry
    await env.DB.prepare(
      `INSERT INTO audit_log (user_id, entity_type, entity_id, action, new_value)
       VALUES (?, 'shift', ?, 'create', ?)`
    )
      .bind(user.userId, shiftId, JSON.stringify({ shiftTypeId: input.shiftTypeId }))
      .run();

    // Pre-create task executions for this shift
    const tasks = await env.DB.prepare(
      `SELECT id FROM task_templates WHERE shift_type_id = ? AND enabled = 1 ORDER BY order_index`
    )
      .bind(input.shiftTypeId)
      .all<{ id: number }>();

    if (tasks.results) {
      const taskInserts = tasks.results.map((task) =>
        env.DB.prepare(
          `INSERT INTO task_executions (shift_id, task_template_id, user_id, task_date, status)
           VALUES (?, ?, ?, ?, 'pending')`
        ).bind(shiftId, task.id, user.userId, today)
      );

      // Batch in groups of 50
      for (let i = 0; i < taskInserts.length; i += 50) {
        await env.DB.batch(taskInserts.slice(i, i + 50));
      }
    }

    const response: ShiftResponse = {
      id: shiftId,
      status: "active",
      startedAt: now,
      shiftTypeId: input.shiftTypeId,
      shiftDate: today,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error starting shift:", error);
    return NextResponse.json({ error: "Erro ao iniciar turno" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await requireChatGPTUser("/shifts");

    await ensureShiftsSchema();

    // Get today's shift for user
    const today = new Date().toISOString().split("T")[0];

    const shift = await env.DB.prepare(
      `SELECT id, shift_type_id, shift_date, started_at, status, expected_qsl_rounds, qsl_frequency_minutes
       FROM shifts
       WHERE user_id = ? AND shift_date = ?
       ORDER BY created_at DESC
       LIMIT 1`
    )
      .bind(user.userId, today)
      .first();

    if (!shift) {
      return NextResponse.json({ shift: null });
    }

    return NextResponse.json({ shift });
  } catch (error) {
    console.error("Error fetching shift:", error);
    return NextResponse.json({ shift: null });
  }
}
