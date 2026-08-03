import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { users } from "../../../../db/schema";
import { createSession, sessionCookie, verifyPassword } from "../_lib";

export async function POST(request: Request) {
  const body = (await request.json()) as { login?: string; password?: string };
  const login = body.login?.trim().toLowerCase() || "";
  const [user] = await getDb().select().from(users).where(eq(users.login, login)).limit(1);
  if (!user || !(await verifyPassword(body.password || "", user.passwordHash))) return Response.json({ error: "Login ou password incorretos." }, { status: 401 });
  if (user.status === "pendente") return Response.json({ error: "O seu acesso ainda aguarda aprovação do administrador." }, { status: 403 });
  if (user.status !== "ativo") return Response.json({ error: "Este acesso não está ativo. Contacte o administrador." }, { status: 403 });
  const session = await createSession(user.id);
  return Response.json({ user: { id: user.id, name: user.name, login: user.login, role: user.role, department: user.department, status: user.status } }, { headers: { "Set-Cookie": sessionCookie(session.token) } });
}
