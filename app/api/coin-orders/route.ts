import { desc, eq, isNull } from "drizzle-orm";
import { getDb } from "../../../db";
import { coinOrders } from "../../../db/schema";
import { requireUser } from "../auth/_lib";

const denominations = ["0.05", "0.1", "0.2", "0.5", "1"] as const;
const bagValues: Record<string, number> = { "0.05": 50, "0.1": 80, "0.2": 160, "0.5": 300, "1": 375 };

const serialize = (record: typeof coinOrders.$inferSelect) => ({
  ...record,
  quantities: JSON.parse(record.quantities) as Record<string, number>,
  orderManager: record.orderManager || (!record.depositAt ? record.responsibleManager : ""),
  depositManager: record.depositManager || (record.depositAt ? record.responsibleManager : ""),
});

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
    const payload = await request.json() as { orderDate?: string; quantities?: Record<string, number>; orderManager?: string };
    const pending = await getDb().select({ id: coinOrders.id }).from(coinOrders).where(isNull(coinOrders.depositAt)).limit(2);
    if (pending.length >= 2) throw new Error("Já existem dois depósitos pendentes. Registe pelo menos um depósito antes de criar outro pedido.");
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
    const orderManager = payload.orderManager?.trim() || "";
    if (!orderManager) throw new Error("Selecione o gerente do pedido.");
    const [record] = await getDb().insert(coinOrders).values({ orderDate, quantities: JSON.stringify(quantities), totalAmount, orderManager, responsibleManager: orderManager, createdBy: auth.user.id, createdByName: auth.user.name || auth.user.login }).returning();
    return Response.json({ record: serialize(record) }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Não foi possível guardar o pedido." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireUser(request, ["admin"]);
  if (auth.error) return auth.error;
  try {
    const payload = await request.json() as { id?: number; status?: "Pendente" | "Depositado"; depositManager?: string };
    const id = Number(payload.id);
    if (!id || !payload.status) throw new Error("Selecione um estado válido.");
    const [current] = await getDb().select().from(coinOrders).where(eq(coinOrders.id, id)).limit(1);
    if (!current) return Response.json({ error: "Pedido não encontrado." }, { status: 404 });
    const depositManager = payload.depositManager?.trim() || "";
    if (payload.status === "Depositado" && !depositManager) throw new Error("Selecione o gerente do depósito.");
    const [record] = await getDb().update(coinOrders).set(payload.status === "Depositado"
      ? { depositAt: current.depositAt || new Date().toISOString(), depositManager, updatedAt: new Date().toISOString() }
      : { depositAt: null, depositManager: "", updatedAt: new Date().toISOString() }
    ).where(eq(coinOrders.id, id)).returning();
    if (!record) return Response.json({ error: "Pedido não encontrado." }, { status: 404 });
    return Response.json({ record: serialize(record) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Não foi possível registar o depósito." }, { status: 400 });
  }
}
