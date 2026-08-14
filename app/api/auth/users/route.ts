import { asc, eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "../../../../db";
import { sessions, users } from "../../../../db/schema";
import { AppRole, requireUser } from "../_lib";

const userDepartments = ["qualidade", "pessoas", "cliente", "manutencao"] as const;
type UserDepartment = typeof userDepartments[number] | "";
const safeFields = { id: users.id, name: users.name, login: users.login, role: users.role, department: users.department, status: users.status, createdAt: users.createdAt, approvedAt: users.approvedAt };
const requestsApi = "https://candidaturas-imperial.tiagosoutelo.chatgpt.site/api/pedidos-acesso";

type PublicRequest = { id: number; name: string; email: string; passwordHash: string; status: string; role: AppRole; department: UserDepartment; createdAt: string };

async function publicAccessRequest(path = "", init?: RequestInit) {
  const token = (env as unknown as { TALENT_PORTAL_TOKEN?: string }).TALENT_PORTAL_TOKEN;
  if (!token) throw new Error("A ligação aos pedidos públicos ainda não está configurada.");
  return fetch(`${requestsApi}${path}`, { ...init, headers: { Authorization: `Bearer ${token}`, ...(init?.headers || {}) } });
}

async function loadPublicRequests() {
  const response = await publicAccessRequest();
  const data = await response.json() as { requests?: PublicRequest[]; error?: string };
  if (!response.ok) throw new Error(data.error || "Não foi possível consultar os pedidos públicos.");
  return data.requests || [];
}

export async function GET(request: Request) {
  const auth = await requireUser(request, ["admin"]);
  if (auth.error) return auth.error;
  return Response.json({ users: await getDb().select(safeFields).from(users).orderBy(asc(users.createdAt)) });
}

export async function PATCH(request: Request) {
  const auth = await requireUser(request, ["admin"]);
  if (auth.error) return auth.error;
  const body = (await request.json()) as { id?: number; role?: AppRole; department?: UserDepartment; status?: "ativo" | "pendente" | "rejeitado" };
  if (!body.id) return Response.json({ error: "Utilizador obrigatório." }, { status: 400 });
  if (body.id < 0) {
    try {
      const requestId = -body.id;
      const remoteRequests = await loadPublicRequests();
      const remote = remoteRequests.find((entry) => entry.id === requestId && entry.status === "pendente");
      if (!remote) return Response.json({ error: "Pedido público não encontrado." }, { status: 404 });
      if (!body.status) {
        const response = await publicAccessRequest("", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: requestId, role: body.role, department: body.department }) });
        const data = await response.json() as { request?: PublicRequest; error?: string };
        if (!response.ok || !data.request) return Response.json({ error: data.error || "Não foi possível atualizar o pedido." }, { status: response.status });
        const entry = data.request;
        return Response.json({ user: { id: -entry.id, name: entry.name, login: entry.email, role: entry.role, department: entry.department, status: "pendente", createdAt: entry.createdAt, approvedAt: null } });
      }
      const db = getDb();
      const [existing] = await db.select(safeFields).from(users).where(eq(users.login, remote.email)).limit(1);
      const targetRole = body.role || remote.role || "consulta";
      const targetDepartment = body.department !== undefined ? body.department : remote.department || "";
      let user = existing;
      if (!user) {
        const [created] = await db.insert(users).values({ name: remote.name, login: remote.email, passwordHash: remote.passwordHash, role: targetRole, department: targetDepartment, status: body.status, approvedAt: body.status === "ativo" ? new Date().toISOString() : null }).returning(safeFields);
        user = created;
      }
      const remoteStatus = body.status === "ativo" ? "processado" : "rejeitado";
      await publicAccessRequest("", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: requestId, status: remoteStatus }) });
      return Response.json({ user });
    } catch (error) {
      return Response.json({ error: error instanceof Error ? error.message : "Não foi possível validar o pedido público." }, { status: 503 });
    }
  }
  if (body.id === auth.user.id && (body.status && body.status !== "ativo" || body.role && body.role !== "admin")) return Response.json({ error: "Não pode retirar o seu próprio acesso de administrador." }, { status: 400 });
  const updates: { role?: string; department?: string; status?: string; approvedAt?: string | null } = {};
  if (body.role && ["admin", "editor", "consulta"].includes(body.role)) updates.role = body.role;
  if (body.department !== undefined && (body.department === "" || userDepartments.includes(body.department))) updates.department = body.department;
  if (body.status && ["ativo", "pendente", "rejeitado"].includes(body.status)) {
    updates.status = body.status;
    updates.approvedAt = body.status === "ativo" ? new Date().toISOString() : null;
  }
  const [updated] = await getDb().update(users).set(updates).where(eq(users.id, body.id)).returning(safeFields);
  return Response.json({ user: updated });
}

export async function DELETE(request: Request) {
  const auth = await requireUser(request, ["admin"]);
  if (auth.error) return auth.error;
  const body = (await request.json()) as { id?: number };
  if (!body.id) return Response.json({ error: "Utilizador obrigatório." }, { status: 400 });
  if (body.id === auth.user.id) return Response.json({ error: "Não pode eliminar a conta que está a utilizar." }, { status: 400 });
  const db = getDb();
  const [target] = await db.select({ id: users.id }).from(users).where(eq(users.id, body.id)).limit(1);
  if (!target) return Response.json({ error: "Utilizador não encontrado." }, { status: 404 });
  await db.delete(sessions).where(eq(sessions.userId, body.id));
  await db.delete(users).where(eq(users.id, body.id));
  return Response.json({ deleted: true, id: body.id });
}
