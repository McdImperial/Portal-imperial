import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { natureWalkRegistrations } from "../../../db/schema";
import { requireUser } from "../auth/_lib";

const statuses = ["Pendente", "Aprovada", "Não aprovada"] as const;

function canManage(user: { role: string; department: string }) {
  return user.role === "admin" || user.role === "editor" && user.department === "pessoas";
}

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (auth.error) return auth.error;
  if (!canManage(auth.user)) return Response.json({ error: "Não tem permissão para consultar as inscrições." }, { status: 403 });
  const registrations = await getDb().select().from(natureWalkRegistrations).orderBy(desc(natureWalkRegistrations.createdAt), asc(natureWalkRegistrations.name));
  return Response.json({ registrations });
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { name?: string; interested?: boolean; sharingItem?: string };
    const name = body.name?.trim() || "";
    const sharingItem = body.sharingItem?.trim() || "";
    if (name.length < 2 || name.length > 100) throw new Error("Indique o seu nome.");
    if (typeof body.interested !== "boolean") throw new Error("Indique se tem interesse em participar.");
    if (sharingItem.length > 300) throw new Error("A descrição do que pretende levar não pode ultrapassar 300 caracteres.");
    const [registration] = await getDb().insert(natureWalkRegistrations).values({ name, interested: body.interested, sharingItem, updatedAt: new Date().toISOString() }).returning();
    return Response.json({ registration, message: "Inscrição registada com sucesso." }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Não foi possível registar a inscrição." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireUser(request);
  if (auth.error) return auth.error;
  if (!canManage(auth.user)) return Response.json({ error: "Não tem permissão para validar inscrições." }, { status: 403 });
  const body = await request.json() as { id?: number; status?: string };
  if (!body.id || !body.status || !statuses.includes(body.status as typeof statuses[number])) return Response.json({ error: "Dados de validação inválidos." }, { status: 400 });
  const [registration] = await getDb().update(natureWalkRegistrations).set({ status: body.status, updatedAt: new Date().toISOString() }).where(eq(natureWalkRegistrations.id, body.id)).returning();
  return registration ? Response.json({ registration }) : Response.json({ error: "Inscrição não encontrada." }, { status: 404 });
}
