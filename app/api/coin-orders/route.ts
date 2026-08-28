import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { coinOrders } from "../../../db/schema";
import { requireUser } from "../auth/_lib";

const denominations = ["0.05", "0.1", "0.2", "0.5", "1"] as const;
const bagValues: Record<string, number> = { "0.05": 50, "0.1": 80, "0.2": 160, "0.5": 300, "1": 375 };

const serialize = (record: typeof coinOrders.$inferSelect) => ({ ...record, quantities: JSON.parse(record.quantities) as Record<string, number> });

export async function GET(request: Request) {
  const auth = await requireUser(request, ["admin"]);
  if (auth.error) return auth.error;
  const records = await getDb().select().from(coinOrders).orderBy(desc(coinOrders.orderDate), desc(coinOrders.id));
  return Response.json({ records: records.map(serialize) });
}

export async function POST(request: Request) {
  const auth = await requireUser(request, ["admin"]);
  if (auth.error) return auth.error;
  try {
    const payload = await request.json() as { orderDate?: string; quantities?: Record<string, number>; depositAt?: string; responsibleManager?: string };
    const orderDate = payload.orderDate?.trim() || "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(orderDate)) throw new Error("Selecione uma data válida.");
    const source = payload.quantities || {};
    const quantities = Object.fromEntries(denominations.map((key) => {
      const value = Number(source[key] || 0);
      if (!Number.isInteger(value) || value < 0 || value > 10000) throw new Error("As quantidades devem ser números inteiros positivos.");
      return [key, value];
    }));
    const totalAmount = Math.round(denominations.reduce((sum, key) => sum + quantities[key] * bagValues[key], 0) * 100) / 100;
    if (totalAmount <= 0) throw new Error("Indique pelo menos uma manga de moedas.");
    const depositAt = payload.depositAt?.trim() || null;
    const responsibleManager = payload.responsibleManager?.trim() || "";
    if ((depositAt && !responsibleManager) || (!depositAt && responsibleManager)) throw new Error("A data do depósito e o gerente responsável devem ser preenchidos em conjunto.");
    const [record] = await getDb().insert(coinOrders).values({ orderDate, quantities: JSON.stringify(quantities), totalAmount, depositAt, responsibleManager, createdBy: auth.user.id, createdByName: auth.user.name || auth.user.login }).returning();
    return Response.json({ record: serialize(record) }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Não foi possível guardar o pedido." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireUser(request, ["admin"]);
  if (auth.error) return auth.error;
  try {
    const payload = await request.json() as { id?: number; depositAt?: string; responsibleManager?: string };
    const id = Number(payload.id);
    const depositAt = payload.depositAt?.trim() || "";
    const responsibleManager = payload.responsibleManager?.trim() || "";
    if (!id || !depositAt || !responsibleManager) throw new Error("Indique o momento do depósito e o gerente responsável.");
    const [record] = await getDb().update(coinOrders).set({ depositAt, responsibleManager, updatedAt: new Date().toISOString() }).where(eq(coinOrders.id, id)).returning();
    if (!record) return Response.json({ error: "Pedido não encontrado." }, { status: 404 });
    return Response.json({ record: serialize(record) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Não foi possível registar o depósito." }, { status: 400 });
  }
}
