import { asc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { tasks } from "../../../db/schema";

type TaskPayload = {
  id?: number;
  title?: string;
  department?: string;
  area?: string;
  due?: string;
  assignee?: string;
  assigneeName?: string | null;
  priority?: string;
  status?: string;
  done?: boolean;
  position?: number;
};

function clientTask(row: typeof tasks.$inferSelect) {
  return { ...row, done: row.status === "Concluído" };
}

function valuesFrom(payload: TaskPayload, position = 0) {
  return {
    title: payload.title?.trim() || "Nova tarefa",
    department: payload.department || "qualidade",
    area: payload.area || "Área geral",
    due: payload.due || "Sem data",
    assignee: payload.assignee || "TS",
    assigneeName: payload.assigneeName || null,
    priority: payload.priority || "Média",
    status: payload.status || (payload.done ? "Concluído" : "Por fazer"),
    position: payload.position ?? position,
    updatedAt: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const rows = await getDb().select().from(tasks).orderBy(asc(tasks.position), asc(tasks.id));
    return Response.json({ tasks: rows.map(clientTask) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao carregar tarefas" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as TaskPayload | { tasks: TaskPayload[] };
    const db = getDb();
    if ("tasks" in payload) {
      const existing = await db.select({ id: tasks.id }).from(tasks).limit(1);
      if (existing.length) {
        const rows = await db.select().from(tasks).orderBy(asc(tasks.position), asc(tasks.id));
        return Response.json({ tasks: rows.map(clientTask) });
      }
      const seeded = await db.insert(tasks).values(payload.tasks.map((task, index) => valuesFrom(task, index))).returning();
      return Response.json({ tasks: seeded.map(clientTask) }, { status: 201 });
    }
    const [created] = await db.insert(tasks).values(valuesFrom(payload)).returning();
    return Response.json({ task: clientTask(created) }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao criar tarefa" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as TaskPayload;
    if (!payload.id) return Response.json({ error: "id obrigatório" }, { status: 400 });
    const updates: Record<string, string | number | null> = { updatedAt: new Date().toISOString() };
    for (const key of ["title", "department", "area", "due", "assignee", "assigneeName", "priority", "status", "position"] as const) {
      if (payload[key] !== undefined) updates[key] = payload[key] as string | number | null;
    }
    const [updated] = await getDb().update(tasks).set(updates).where(eq(tasks.id, payload.id)).returning();
    return Response.json({ task: clientTask(updated) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao atualizar tarefa" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const payload = (await request.json()) as { id?: number };
    if (!payload.id) return Response.json({ error: "id obrigatório" }, { status: 400 });
    await getDb().delete(tasks).where(eq(tasks.id, payload.id));
    return Response.json({ deleted: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao apagar tarefa" }, { status: 500 });
  }
}
