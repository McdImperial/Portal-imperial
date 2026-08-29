import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { vaultInvoices } from "../../../db/schema";
import { requireUser } from "../auth/_lib";

const rubrics = ["Outros Gastos Controláveis", "Combustível"];
const tags = ["Equipamento Pequeno", "Combustível", "Correios", "Farmácia", "Formação", "Plano LRM", "Plano Motivacional", "Outros"];
const beneficiaries = ["Restaurante", "Escritório"];

const serialize = (record: typeof vaultInvoices.$inferSelect) => ({ ...record, items: JSON.parse(record.items) as string[] });

function values(payload: Record<string, unknown>) {
  const invoiceDate = String(payload.invoiceDate || "").trim();
  const entity = String(payload.entity || "").trim();
  const items = Array.isArray(payload.items) ? payload.items.map(String).map((item) => item.trim()).filter(Boolean) : [];
  const totalAmount = Math.round(Number(payload.totalAmount) * 100) / 100;
  const rubric = String(payload.rubric || ""); const tag = String(payload.tag || ""); const beneficiary = String(payload.beneficiary || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(invoiceDate)) throw new Error("Selecione a data da fatura.");
  if (!entity) throw new Error("Indique a entidade.");
  if (!items.length) throw new Error("Indique pelo menos um artigo da fatura.");
  if (!Number.isFinite(totalAmount) || totalAmount < 0) throw new Error("Indique um total válido.");
  if (!rubrics.includes(rubric) || !tags.includes(tag) || !beneficiaries.includes(beneficiary)) throw new Error("Complete a classificação da fatura.");
  return { invoiceDate, entity, items: JSON.stringify(items), totalAmount, rubric, tag, beneficiary, verified: Boolean(payload.verified), pettyCash: Boolean(payload.pettyCash), imageName: String(payload.imageName || "").slice(0, 180), updatedAt: new Date().toISOString() };
}

export async function GET(request: Request) {
  const auth = await requireUser(request); if (auth.error) return auth.error;
  const records = await getDb().select().from(vaultInvoices).orderBy(desc(vaultInvoices.invoiceDate), desc(vaultInvoices.id));
  return Response.json({ records: records.map(serialize) });
}

export async function POST(request: Request) {
  const auth = await requireUser(request); if (auth.error) return auth.error;
  try { const payload = await request.json() as Record<string, unknown>; const [record] = await getDb().insert(vaultInvoices).values({ ...values(payload), createdBy: auth.user.id, createdByName: auth.user.name || auth.user.login }).returning(); return Response.json({ record: serialize(record) }, { status: 201 }); }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Não foi possível guardar a fatura." }, { status: 400 }); }
}

export async function PATCH(request: Request) {
  const auth = await requireUser(request); if (auth.error) return auth.error;
  try { const payload = await request.json() as Record<string, unknown>; const id = Number(payload.id); if (!id) throw new Error("Fatura inválida."); const [record] = await getDb().update(vaultInvoices).set(values(payload)).where(eq(vaultInvoices.id, id)).returning(); if (!record) return Response.json({ error: "Fatura não encontrada." }, { status: 404 }); return Response.json({ record: serialize(record) }); }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Não foi possível atualizar a fatura." }, { status: 400 }); }
}

export async function DELETE(request: Request) {
  const auth = await requireUser(request, ["admin"]); if (auth.error) return auth.error;
  const id = Number((await request.json() as { id?: number }).id); if (!id) return Response.json({ error: "Fatura inválida." }, { status: 400 });
  const [deleted] = await getDb().delete(vaultInvoices).where(eq(vaultInvoices.id, id)).returning({ id: vaultInvoices.id });
  return deleted ? Response.json({ ok: true }) : Response.json({ error: "Fatura não encontrada." }, { status: 404 });
}
