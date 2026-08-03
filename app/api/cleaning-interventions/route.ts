import { asc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { cleaningInterventions } from "../../../db/schema";
import { requireUser } from "../auth/_lib";

const areasByDepartment = {
  qualidade: ["Positiva / Negativa", "Stock secos", "Aquário", "Balneários Funcionários", "Sala de pausa", "Sala de HM", "Balneários de Gerentes"],
  cliente: ["Sala piso 0", "Sala piso -1", "WC Clientes", "Cantinho RPs", "Corredor interno P -1"],
  pessoas: ["Sala piso 0", "Sala piso -1", "WC Clientes", "Cantinho RPs", "Corredor interno P -1"],
  manutencao: ["Cozinha", "Copa", "Sala de peças", "Sala de lixo", "Zona Técnica", "Esplanada"],
} as const;
type InterventionDepartment = keyof typeof areasByDepartment;
const kinds = ["Limpeza", "Manutenção"] as const;

type InterventionPayload = {
  id?: number;
  department?: InterventionDepartment;
  area?: string;
  kind?: string;
  scheduledDate?: string;
  estimatedHours?: number;
  resources?: string;
  status?: "Agendada" | "Encerrada";
};

function canManage(user: { role: string; department: string }, department: InterventionDepartment) {
  return user.role === "admin" || user.role === "editor" && user.department === department;
}

function validatedValues(payload: InterventionPayload) {
  const department = payload.department;
  const area = payload.area?.trim() || "";
  const kind = payload.kind?.trim() || "";
  const scheduledDate = payload.scheduledDate?.trim() || "";
  const estimatedHours = Number(payload.estimatedHours);
  const resources = payload.resources?.trim() || "";
  if (!department || !(department in areasByDepartment)) throw new Error("Selecione um departamento válido.");
  if (!(areasByDepartment[department] as readonly string[]).includes(area)) throw new Error("Selecione uma área válida.");
  if (!kinds.includes(kind as typeof kinds[number])) throw new Error("Selecione o tipo de intervenção.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate)) throw new Error("Indique a data da intervenção.");
  if (!Number.isFinite(estimatedHours) || estimatedHours <= 0 || estimatedHours > 999) throw new Error("Indique uma estimativa de horas válida.");
  if (!resources) throw new Error("Indique os recursos necessários.");
  if (resources.length > 500) throw new Error("Os recursos não podem ultrapassar 500 caracteres.");
  return { department, area, kind, scheduledDate, estimatedHours, resources };
}

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (auth.error) return auth.error;
  const requestedDepartment = new URL(request.url).searchParams.get("department") as InterventionDepartment | null;
  const department = requestedDepartment || auth.user.department as InterventionDepartment;
  if (!department || !(department in areasByDepartment)) return Response.json({ error: "Departamento inválido." }, { status: 400 });
  if (auth.user.role !== "admin" && auth.user.department !== department) return Response.json({ error: "Não tem acesso às intervenções deste departamento." }, { status: 403 });
  const rows = await getDb().select().from(cleaningInterventions).where(eq(cleaningInterventions.department, department)).orderBy(asc(cleaningInterventions.scheduledDate), asc(cleaningInterventions.id));
  return Response.json({ interventions: rows });
}

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if (auth.error) return auth.error;
  try {
    const values = validatedValues(await request.json() as InterventionPayload);
    if (!canManage(auth.user, values.department)) return Response.json({ error: "Apenas administradores ou editores do departamento podem agendar intervenções." }, { status: 403 });
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
  const payload = await request.json() as InterventionPayload;
  if (!payload.id) return Response.json({ error: "Intervenção obrigatória." }, { status: 400 });
  const [existing] = await getDb().select({ department: cleaningInterventions.department }).from(cleaningInterventions).where(eq(cleaningInterventions.id, payload.id)).limit(1);
  if (!existing) return Response.json({ error: "Intervenção não encontrada." }, { status: 404 });
  if (!canManage(auth.user, existing.department as InterventionDepartment)) return Response.json({ error: "Não tem permissão para alterar intervenções deste departamento." }, { status: 403 });
  const updates: { status?: string; closedAt?: string | null; updatedAt: string } = { updatedAt: new Date().toISOString() };
  if (payload.status && ["Agendada", "Encerrada"].includes(payload.status)) {
    updates.status = payload.status;
    updates.closedAt = payload.status === "Encerrada" ? new Date().toISOString() : null;
  }
  const [updated] = await getDb().update(cleaningInterventions).set(updates).where(eq(cleaningInterventions.id, payload.id)).returning();
  return Response.json({ intervention: updated });
}
