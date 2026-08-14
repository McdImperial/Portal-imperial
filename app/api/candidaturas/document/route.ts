import { eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "../../../../db";
import { talentCandidates } from "../../../../db/schema";
import { requireUser } from "../../auth/_lib";

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (auth.error) return auth.error;
  if (!(auth.user.role === "admin" || auth.user.role === "editor" && auth.user.department === "pessoas")) return Response.json({ error: "Não tem permissão para consultar documentos." }, { status: 403 });
  const url = new URL(request.url);
  const id = Number(url.searchParams.get("id"));
  const type = url.searchParams.get("type");
  if (!Number.isInteger(id) || !["cv", "cover"].includes(type || "")) return Response.json({ error: "Documento inválido." }, { status: 400 });
  const [candidate] = await getDb().select().from(talentCandidates).where(eq(talentCandidates.id, id)).limit(1);
  if (!candidate) return Response.json({ error: "Candidatura não encontrada." }, { status: 404 });
  const key = type === "cv" ? candidate.cvKey : candidate.coverLetterKey;
  const name = type === "cv" ? candidate.cvName : candidate.coverLetterName;
  const storage = (env as unknown as { CANDIDATURES?: R2Bucket }).CANDIDATURES;
  if (!storage) return Response.json({ error: "O armazenamento de documentos ainda não está disponível." }, { status: 503 });
  const object = await storage.get(key);
  if (!object?.body) return Response.json({ error: "Documento não encontrado." }, { status: 404 });
  return new Response(object.body, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${name.replace(/"/g, "")}"`, "Cache-Control": "private, no-store" } });
}
