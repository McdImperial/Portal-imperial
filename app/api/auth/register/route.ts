import { getDb } from "../../../../db";
import { users } from "../../../../db/schema";
import { createSession, hashPassword, sessionCookie } from "../_lib";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { login?: string; password?: string };
    const login = body.login?.trim().toLowerCase() || "";
    const password = body.password || "";
    if (!/^[a-z0-9._-]{3,40}$/.test(login)) return Response.json({ error: "O login deve ter 3 a 40 caracteres e usar apenas letras, números, ponto, hífen ou underscore." }, { status: 400 });
    if (password.length < 8) return Response.json({ error: "A password deve ter pelo menos 8 caracteres." }, { status: 400 });
    const db = getDb();
    const existing = await db.select({ id: users.id }).from(users).limit(1);
    const isFirst = existing.length === 0;
    const [created] = await db.insert(users).values({
      login,
      passwordHash: await hashPassword(password),
      role: isFirst ? "admin" : "consulta",
      status: isFirst ? "ativo" : "pendente",
      approvedAt: isFirst ? new Date().toISOString() : null,
    }).returning();
    if (!isFirst) return Response.json({ pending: true, message: "Pedido enviado. Aguarde a aprovação do administrador." }, { status: 201 });
    const session = await createSession(created.id);
    return Response.json({ user: { id: created.id, login: created.login, role: created.role, status: created.status }, firstAdmin: true }, { status: 201, headers: { "Set-Cookie": sessionCookie(session.token) } });
  } catch (error) {
    const message = error instanceof Error && /unique/i.test(error.message) ? "Este login já está registado." : "Não foi possível criar o utilizador.";
    return Response.json({ error: message }, { status: 409 });
  }
}
