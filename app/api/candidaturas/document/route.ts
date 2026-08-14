import { env } from "cloudflare:workers";
import { requireUser } from "../../auth/_lib";

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (auth.error) return auth.error;
  if (!(auth.user.role === "admin" || auth.user.role === "editor" && auth.user.department === "pessoas")) return Response.json({ error: "Não tem permissão para consultar documentos." }, { status: 403 });
  const url = new URL(request.url);
  const id = Number(url.searchParams.get("id"));
  const type = url.searchParams.get("type");
  if (!Number.isInteger(id) || !["cv", "cover"].includes(type || "")) return Response.json({ error: "Documento inválido." }, { status: 400 });
  const token = (env as unknown as { TALENT_PORTAL_TOKEN?: string }).TALENT_PORTAL_TOKEN;
  if (!token) return Response.json({ error: "A ligação às candidaturas públicas ainda não está configurada." }, { status: 503 });
  const remote = await fetch(`https://candidaturas-imperial.tiagosoutelo.chatgpt.site/api/candidaturas/document?id=${id}&type=${type}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!remote.ok) return Response.json(await remote.json(), { status: remote.status });
  return new Response(remote.body, { headers: { "Content-Type": remote.headers.get("Content-Type") || "application/pdf", "Content-Disposition": remote.headers.get("Content-Disposition") || "inline", "Cache-Control": "private, no-store" } });
}
