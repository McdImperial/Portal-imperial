import { asc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { cleaningInterventions } from "../../../db/schema";
import { requireUser } from "../auth/_lib";

const areas = ["Positiva / Negativa", "Stock secos", "Aquário", "Balneários Funcionários", "Sala de pausa", "Sala de HM", "Balneários de Gerentes"] as const;
const kinds = ["Limpeza", "Manutenção"] as const;

type InterventionPayload = {
  id?: number;
  area?: string;
  kind?: string;
  scheduledDate?: string;
  estimatedHours?: number;
  resources?: string;
  status?: "Agendada" | "Encerrada";
};

function canManage(user: { role: string; department: string }) {
  return user.role === "admin" || user.role === "editor" && user.department === "qualidade";
}

function validatedValues(payload: InterventionPayload) {
  const area = payload.area?.trim() || "";
  const kind = payload.kind?.trim() || "";
  const scheduledDate = payload.scheduledDate?.trim() || "";
  const estimatedHours = Number(payload.estimatedHours);
  const resources = payload.resources?.trim() || "";
  if (!areas.includes(area as typeof areas[number])) throw new Error("Selecione uma área válida.");
  if (!kinds.includes(kind as typeof kinds[number])) throw new Error("Selecione o tipo de intervenção.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate)) throw new Error("Indique a data da intervenção.");
  if (!Number.isFinite(estimatedHours) || estimatedHours <= 0 || estimatedHours > 999) throw new Error("Indique uma estimativa de horas válida.");
  if (!resources) throw new Error("Indique os recursos necessários.");
  if (resources.length > 500) throw new Error("Os recursos não podem ultrapassar 500 caracteres.");
  return { area, kind, scheduledDate, estimatedHours, resources };
}

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (auth.error) return auth.error;
  const rows = await getDb().select().from(cleaningInterventions).orderBy(asc(cleaningInterventions.scheduledDate), asc(cleaningInterventions.id));
  return Response.json({ interventions: rows });
}

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if (auth.error) return auth.error;
  if (!canManage(auth.user)) return Response.json({ error: "Apenas administradores ou editores de Qualidade & Produtos podem agendar intervenções." }, { status: 403 });
  try {
    const values = validatedValues(await request.json() as InterventionPayload);
    const [created] = await getDb().insert(cleaningInterventions).values({
      ...values,
      createdBy: auth.user.id,
      createdByName: auth.user.name || auth.user.login,
      updatedAt: new Date().toISOString(),
    }).returning();
    return Response.json({ intervention: created }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Não foi possível agendar a intervenção." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireUser(request);
  if (auth.error) return auth.error;
  if (!canManage(auth.user)) return Response.json({ error: "Não tem permissão para alterar intervenções." }, { status: 403 });
  const payload = await request.json() as InterventionPayload;
  if (!payload.id) return Response.json({ error: "Intervenção obrigatória." }, { status: 400 });
  const updates: { status?: string; closedAt?: string | null; updatedAt: string } = { updatedAt: new Date().toISOString() };
  if (payload.status && ["Agendada", "Encerrada"].includes(payload.status)) {
    updates.status = payload.status;
    updates.closedAt = payload.status === "Encerrada" ? new Date().toISOString() : null;
  }
  const [updated] = await getDb().update(cleaningInterventions).set(updates).where(eq(cleaningInterventions.id, payload.id)).returning();
  if (!updated) return Response.json({ error: "Intervenção não encontrada." }, { status: 404 });
  return Response.json({ intervention: updated });
}
