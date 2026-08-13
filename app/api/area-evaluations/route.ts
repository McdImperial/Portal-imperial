import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { areaEvaluations } from "../../../db/schema";
import { requireUser } from "../auth/_lib";

const areasByDepartment = {
  qualidade: ["Positiva / Negativa", "Stock secos", "Aquário", "Balneários Funcionários", "Sala de pausa", "Sala de HM", "Balneários de Gerentes"],
  pessoas: ["Sala piso 0", "Sala piso -1", "WC Clientes", "Cantinho RPs", "Corredor interno P -1"],
  cliente: ["Balcão", "Bebidas", "Corredor interno P 0", "Escadas piso 0", "Corredor Escritório", "Escadas Escritório"],
  manutencao: ["Cozinha", "Copa", "Sala de peças", "Sala de lixo", "Zona Técnica", "Esplanada"],
} as const;
const ratings = ["", "Bom", "Aceitável", "Necessita Melhorar", "Não aceitável"] as const;
type EvaluationDepartment = keyof typeof areasByDepartment;
type Rating = typeof ratings[number];

type EvaluationPayload = {
  month?: string;
  evaluations?: {
    department?: EvaluationDepartment;
    area?: string;
    cleaningRating?: Rating;
    maintenanceRating?: Rating;
  }[];
};

function validMonth(month: string) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(month);
}

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (auth.error) return auth.error;
  const params = new URL(request.url).searchParams;
  const department = params.get("department") as EvaluationDepartment | null;
  if (department) {
    if (!(department in areasByDepartment)) return Response.json({ error: "Departamento inválido." }, { status: 400 });
    const evaluations = await getDb().select().from(areaEvaluations).where(eq(areaEvaluations.department, department)).orderBy(desc(areaEvaluations.month), asc(areaEvaluations.area));
    return Response.json({ evaluations });
  }
  const month = params.get("month") || "";
  if (!validMonth(month)) return Response.json({ error: "Mês inválido." }, { status: 400 });
  const evaluations = await getDb().select().from(areaEvaluations).where(eq(areaEvaluations.month, month)).orderBy(asc(areaEvaluations.department), asc(areaEvaluations.area));
  return Response.json({ evaluations });
}

export async function PUT(request: Request) {
  const auth = await requireUser(request, ["admin"]);
  if (auth.error) return auth.error;
  const payload = await request.json() as EvaluationPayload;
  const month = payload.month || "";
  if (!validMonth(month)) return Response.json({ error: "Mês inválido." }, { status: 400 });
  if (!Array.isArray(payload.evaluations)) return Response.json({ error: "Avaliações obrigatórias." }, { status: 400 });
  const now = new Date().toISOString();
  const saved = [];
  for (const item of payload.evaluations) {
    const department = item.department;
    const area = item.area?.trim() || "";
    const cleaningRating = item.cleaningRating ?? "";
    const maintenanceRating = item.maintenanceRating ?? "";
    if (!department || !(department in areasByDepartment)) return Response.json({ error: "Departamento inválido." }, { status: 400 });
    if (!(areasByDepartment[department] as readonly string[]).includes(area)) return Response.json({ error: `Área inválida: ${area}.` }, { status: 400 });
    if (!ratings.includes(cleaningRating) || !ratings.includes(maintenanceRating)) return Response.json({ error: "Classificação inválida." }, { status: 400 });
    const [evaluation] = await getDb().insert(areaEvaluations).values({
      month,
      department,
      area,
      cleaningRating,
      maintenanceRating,
      evaluatedBy: auth.user.id,
      evaluatedByName: auth.user.name || auth.user.login,
      evaluatedAt: now,
    }).onConflictDoUpdate({
      target: [areaEvaluations.month, areaEvaluations.department, areaEvaluations.area],
      set: { cleaningRating, maintenanceRating, evaluatedBy: auth.user.id, evaluatedByName: auth.user.name || auth.user.login, evaluatedAt: now },
    }).returning();
    saved.push(evaluation);
  }
  return Response.json({ evaluations: saved, evaluatedAt: now });
}
