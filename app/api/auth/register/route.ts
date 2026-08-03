import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { users } from "../../../../db/schema";
import { createSession, hashPassword, sessionCookie } from "../_lib";

const ADMIN_EMAIL = "tiago.soutelo@pt.mcd.com";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name?: string; login?: string; password?: string };
    const name = body.name?.trim().replace(/\s+/g, " ") || "";
    const login = body.login?.trim().toLowerCase() || "";
    const password = body.password || "";
    if (name.length < 2 || name.length > 80) return Response.json({ error: "Introduza o nome completo do utilizador." }, { status: 400 });
    if (login.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(login)) return Response.json({ error: "Introduza um endereço de email válido." }, { status: 400 });
    if (password.length < 8) return Response.json({ error: "A password deve ter pelo menos 8 caracteres." }, { status: 400 });
    const db = getDb();
    const existing = await db.select({ id: users.id }).from(users).limit(1);
    const isFirst = existing.length === 0;
    if (isFirst && login !== ADMIN_EMAIL) return Response.json({ error: `A conta de administrador deve usar ${ADMIN_EMAIL}.` }, { status: 403 });
    await db.insert(users).values({
      name,
      login,
      passwordHash: await hashPassword(password),
      role: isFirst ? "admin" : "consulta",
      status: isFirst ? "ativo" : "pendente",
      approvedAt: isFirst ? new Date().toISOString() : null,
    });
    if (!isFirst) return Response.json({ pending: true, message: "Pedido enviado. Aguarde a aprovação do administrador." }, { status: 201 });
    const [created] = await db.select().from(users).where(eq(users.login, login)).limit(1);
    if (!created) return Response.json({ error: "A conta não ficou guardada. Tente novamente." }, { status: 500 });
    const session = await createSession(created.id);
    return Response.json({ user: { id: created.id, name: created.name, login: created.login, role: created.role, department: created.department, status: created.status }, firstAdmin: true }, { status: 201, headers: { "Set-Cookie": sessionCookie(session.token) } });
  } catch (error) {
    console.error("Falha ao criar utilizador", error);
    const message = error instanceof Error && /unique/i.test(error.message) ? "Este login já está registado." : "Não foi possível criar o utilizador.";
    return Response.json({ error: message }, { status: error instanceof Error && /unique/i.test(error.message) ? 409 : 500 });
  }
}
