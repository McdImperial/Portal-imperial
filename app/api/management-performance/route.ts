import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { managementPerformanceEvaluations } from "../../../db/schema";
import { requireUser } from "../auth/_lib";

async function requireAdmin(request: Request) {
  const auth = await requireUser(request);
  if (auth.error) return { error: auth.error, user: null };
  if (auth.user.role !== "admin") return { error: Response.json({ error: "Acesso reservado ao administrador." }, { status: 403 }), user: null };
  return { error: null, user: auth.user };
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;
  const evaluations = await getDb().select().from(managementPerformanceEvaluations).orderBy(desc(managementPerformanceEvaluations.createdAt));
  return Response.json({ evaluations });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error || !auth.user) return auth.error!;
  const body = await request.json() as { managerName?: string; period?: string; scores?: Record<string, number>; quantitativeScore?: number; qualitativeRating?: string; strengths?: string; improvements?: string };
  if (!body.managerName?.trim() || !body.period?.trim() || !body.scores || Object.keys(body.scores).length !== 16) return Response.json({ error: "Preencha o nome, período e todos os critérios." }, { status: 400 });
  const [evaluation] = await getDb().insert(managementPerformanceEvaluations).values({ managerName: body.managerName.trim(), period: body.period.trim(), scores: JSON.stringify(body.scores), quantitativeScore: Number(body.quantitativeScore) || 0, qualitativeRating: body.qualitativeRating || "", strengths: body.strengths?.trim() || "", improvements: body.improvements?.trim() || "", createdBy: auth.user.id, createdByName: auth.user.name || auth.user.login, updatedAt: new Date().toISOString() }).returning();
  return Response.json({ evaluation }, { status: 201 });
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!id) return Response.json({ error: "Avaliação inválida." }, { status: 400 });
  await getDb().delete(managementPerformanceEvaluations).where(eq(managementPerformanceEvaluations.id, id));
  return Response.json({ ok: true });
}
