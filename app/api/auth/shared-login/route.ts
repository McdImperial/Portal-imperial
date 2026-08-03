import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { users } from "../../../../db/schema";
import { verifyPassword } from "../_lib";

export async function POST(request: Request) {
  const authorization = request.headers.get("x-shared-auth") || "";
  if (!env.SHARED_AUTH_SECRET || authorization !== env.SHARED_AUTH_SECRET) {
    return Response.json({ error: "Pedido não autorizado." }, { status: 401 });
  }
  const body = await request.json() as { login?: string; password?: string };
  const login = body.login?.trim().toLowerCase() || "";
  const [user] = await getDb().select().from(users).where(eq(users.login, login)).limit(1);
  if (!user || !(await verifyPassword(body.password || "", user.passwordHash))) {
    return Response.json({ error: "Login ou palavra-passe incorretos." }, { status: 401 });
  }
  if (user.status !== "ativo") {
    return Response.json({ error: user.status === "pendente" ? "O acesso no Imperial ainda aguarda aprovação." : "O acesso no Imperial não está ativo." }, { status: 403 });
  }
  return Response.json({ user: { id: user.id, name: user.name, login: user.login, role: user.role, department: user.department, status: user.status } });
}
