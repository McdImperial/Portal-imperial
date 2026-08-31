import { and, eq, like } from "drizzle-orm";
import { getDb } from "../../../db";
import { pettyCashClosures, vaultInvoices } from "../../../db/schema";
import { requireUser } from "../auth/_lib";

const validMonth = (value: string) => /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

export async function GET(request: Request) {
  const auth = await requireUser(request); if (auth.error) return auth.error;
  const month = new URL(request.url).searchParams.get("month") || "";
  if (!validMonth(month)) return Response.json({ error: "Mês inválido." }, { status: 400 });
  const [closure] = await getDb().select().from(pettyCashClosures).where(eq(pettyCashClosures.month, month)).limit(1);
  return Response.json({ closure: closure || null });
}

export async function POST(request: Request) {
  const auth = await requireUser(request); if (auth.error) return auth.error;
  try {
    const body = await request.json() as { month?: string; completedDate?: string; manager?: string };
    const month = String(body.month || ""); const completedDate = String(body.completedDate || ""); const manager = String(body.manager || "").trim();
    if (!validMonth(month) || !validDate(completedDate) || completedDate.slice(0, 7) !== month) throw new Error("Selecione uma data válida dentro do mês do Petty Cash.");
    if (!manager) throw new Error("Selecione o gerente responsável.");
    const records = await getDb().select().from(vaultInvoices).where(and(eq(vaultInvoices.pettyCash, true), like(vaultInvoices.invoiceDate, `${month}-%`)));
    if (!records.length) throw new Error("Não existem movimentos de Petty Cash neste mês.");
    if (records.some((record) => !record.verified)) throw new Error("Valide todos os movimentos antes de concluir o Petty Cash do mês.");
    const values = { month, completedDate, manager, completedBy: auth.user.id, completedByName: auth.user.name || auth.user.login, updatedAt: new Date().toISOString() };
    const [closure] = await getDb().insert(pettyCashClosures).values(values).onConflictDoUpdate({ target: pettyCashClosures.month, set: values }).returning();
    return Response.json({ closure });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Não foi possível concluir o Petty Cash." }, { status: 400 }); }
}
