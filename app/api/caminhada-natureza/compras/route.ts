import { asc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { natureWalkShoppingItems } from "../../../../db/schema";
import { requireUser } from "../../auth/_lib";

async function requireAdmin(request: Request) {
  const auth = await requireUser(request);
  if (auth.error) return { error: auth.error, user: null };
  if (auth.user.role !== "admin") return { error: Response.json({ error: "Acesso reservado ao administrador." }, { status: 403 }), user: null };
  return { error: null, user: auth.user };
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;
  const items = await getDb().select().from(natureWalkShoppingItems).orderBy(asc(natureWalkShoppingItems.createdAt));
  return Response.json({ items });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error || !auth.user) return auth.error!;
  const body = await request.json() as { product?: string; quantity?: string };
  const product = body.product?.trim() || "";
  const quantity = body.quantity?.trim() || "";
  if (!product || !quantity) return Response.json({ error: "Indique o produto e a quantidade." }, { status: 400 });
  const [item] = await getDb().insert(natureWalkShoppingItems).values({ product, quantity, createdBy: auth.user.id, createdByName: auth.user.name || auth.user.login, updatedAt: new Date().toISOString() }).returning();
  return Response.json({ item }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;
  const body = await request.json() as { id?: number; product?: string; quantity?: string };
  const product = body.product?.trim() || "";
  const quantity = body.quantity?.trim() || "";
  if (!body.id || !product || !quantity) return Response.json({ error: "Dados inválidos." }, { status: 400 });
  const [item] = await getDb().update(natureWalkShoppingItems).set({ product, quantity, updatedAt: new Date().toISOString() }).where(eq(natureWalkShoppingItems.id, body.id)).returning();
  return item ? Response.json({ item }) : Response.json({ error: "Produto não encontrado." }, { status: 404 });
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!id) return Response.json({ error: "Produto inválido." }, { status: 400 });
  await getDb().delete(natureWalkShoppingItems).where(eq(natureWalkShoppingItems.id, id));
  return Response.json({ ok: true });
}
