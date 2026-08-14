import { eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "../../../../db";
import { users } from "../../../../db/schema";

type RequestBody = { name?: string; email?: string; passwordHash?: string };

export async function POST(request: Request) {
  const token = request.headers.get("x-public-request-token");
  const expected = (env as unknown as { PUBLIC_REQUEST_TOKEN?: string }).PUBLIC_REQUEST_TOKEN;
  if (!expected || token !== expected) return Response.json({ error: "Pedido não autorizado." }, { status: 401 });
  const body = (await request.json()) as RequestBody;
  const name = body.name?.trim();
  const login = body.email?.trim().toLowerCase();
  const passwordHash = body.passwordHash?.trim();
  if (!name || !login || !passwordHash) return Response.json({ error: "Dados de pedido incompletos." }, { status: 400 });
  const db = getDb();
  const [existing] = await db.select({ id: users.id, status: users.status }).from(users).where(eq(users.login, login)).limit(1);
  if (existing) return Response.json({ created: false, status: existing.status });
  const [user] = await db.insert(users).values({ name, login, passwordHash, role: "consulta", department: "", status: "pendente" }).returning({ id: users.id, name: users.name, login: users.login, status: users.status, createdAt: users.createdAt });
  return Response.json({ created: true, user }, { status: 201 });
}
