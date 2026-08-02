import { asc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { users } from "../../../../db/schema";
import { AppRole, requireUser } from "../_lib";

const safeFields = { id: users.id, login: users.login, role: users.role, status: users.status, createdAt: users.createdAt, approvedAt: users.approvedAt };

export async function GET(request: Request) {
  const auth = await requireUser(request, ["admin"]);
  if (auth.error) return auth.error;
  return Response.json({ users: await getDb().select(safeFields).from(users).orderBy(asc(users.createdAt)) });
}

export async function PATCH(request: Request) {
  const auth = await requireUser(request, ["admin"]);
  if (auth.error) return auth.error;
  const body = (await request.json()) as { id?: number; role?: AppRole; status?: "ativo" | "pendente" | "rejeitado" };
  if (!body.id) return Response.json({ error: "Utilizador obrigatório." }, { status: 400 });
  if (body.id === auth.user.id && (body.status && body.status !== "ativo" || body.role && body.role !== "admin")) return Response.json({ error: "Não pode retirar o seu próprio acesso de administrador." }, { status: 400 });
  const updates: { role?: string; status?: string; approvedAt?: string | null } = {};
  if (body.role && ["admin", "editor", "consulta"].includes(body.role)) updates.role = body.role;
  if (body.status && ["ativo", "pendente", "rejeitado"].includes(body.status)) {
    updates.status = body.status;
    updates.approvedAt = body.status === "ativo" ? new Date().toISOString() : null;
  }
  const [updated] = await getDb().update(users).set(updates).where(eq(users.id, body.id)).returning(safeFields);
  return Response.json({ user: updated });
}
