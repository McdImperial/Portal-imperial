import { desc, eq, like } from "drizzle-orm";
import { getDb } from "../../../db";
import { vaultControls } from "../../../db/schema";
import { requireUser } from "../auth/_lib";

const shifts = ["Manhã", "Tarde", "Madrugada"] as const;
const coinDenominations = ["0.05", "0.1", "0.2", "0.5", "1"] as const;
const noteDenominations = ["5", "10", "20", "50", "100", "200", "500"] as const;
const largeBagValues: Record<string, number> = { "0.05": 50, "0.1": 80, "0.2": 160, "0.5": 300, "1": 375 };
const smallBagValues: Record<string, number> = { "0.05": 2.5, "0.1": 4, "0.2": 8, "0.5": 20, "1": 25 };

type Payload = {
  controlDate?: string;
  shift?: typeof shifts[number];
  largeBags?: Record<string, number>;
  smallBags?: Record<string, number>;
  noteCounts?: Record<string, number>;
  looseCoins?: number;
  tillFunds?: number;
  invoices?: number;
  bankCoins1?: number;
  bankCoins2?: number;
  deliveringManager?: string;
  receivingManager?: string;
};

const validMap = (value: unknown, denominations: readonly string[]) => {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return Object.fromEntries(denominations.map((key) => {
    const count = Number(source[key] || 0);
    if (!Number.isInteger(count) || count < 0 || count > 10000) throw new Error("As quantidades devem ser números inteiros positivos.");
    return [key, count];
  }));
};

const amount = (value: unknown, label: string) => {
  const number = Number(value || 0);
  if (!Number.isFinite(number) || number < 0 || number > 1_000_000) throw new Error(`${label} inválido.`);
  return Math.round(number * 100) / 100;
};

function normalizePayload(payload: Payload) {
  const controlDate = payload.controlDate?.trim() || "";
  const shift = payload.shift;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(controlDate)) throw new Error("Selecione uma data válida.");
  if (!shift || !shifts.includes(shift)) throw new Error("Selecione o turno.");
  const largeBags = validMap(payload.largeBags, coinDenominations);
  const smallBags = validMap(payload.smallBags, coinDenominations);
  const noteCounts = validMap(payload.noteCounts, noteDenominations);
  const looseCoins = amount(payload.looseCoins, "Valor das moedas soltas");
  const tillFunds = amount(payload.tillFunds, "Valor dos fundos de caixa");
  const invoices = amount(payload.invoices, "Valor das faturas");
  const bankCoins1 = amount(payload.bankCoins1, "Moedas banco 1");
  const bankCoins2 = amount(payload.bankCoins2, "Moedas banco 2");
  const deliveringManager = payload.deliveringManager?.trim() || "";
  const receivingManager = payload.receivingManager?.trim() || "";
  if (!deliveringManager || !receivingManager) throw new Error("Indique os dois gerentes responsáveis.");
  const coinsTotal = coinDenominations.reduce((sum, key) => sum + largeBags[key] * largeBagValues[key] + smallBags[key] * smallBagValues[key], 0);
  const notesTotal = noteDenominations.reduce((sum, key) => sum + noteCounts[key] * Number(key), 0);
  // Fórmulas validadas na folha Controlo Cofre 2026: manhã = 1 250 €;
  // tarde e madrugada = 1 000 € + fundos de caixa.
  const theoreticalTotal = shift === "Manhã" ? 1250 : 1000 + tillFunds;
  const countedTotal = Math.round((coinsTotal + notesTotal + looseCoins + tillFunds + invoices) * 100) / 100;
  const vaultTotal = Math.round((bankCoins1 + bankCoins2 + theoreticalTotal) * 100) / 100;
  const difference = Math.round((countedTotal - vaultTotal) * 100) / 100;
  return { controlDate, shift, largeBags: JSON.stringify(largeBags), smallBags: JSON.stringify(smallBags), noteCounts: JSON.stringify(noteCounts), looseCoins, tillFunds, invoices, bankCoins1, bankCoins2, theoreticalTotal, countedTotal, vaultTotal, difference, deliveringManager, receivingManager };
}

function serializeRecord(record: typeof vaultControls.$inferSelect) {
  const largeBags = JSON.parse(record.largeBags) as Record<string, number>;
  const smallBags = JSON.parse(record.smallBags) as Record<string, number>;
  const noteCounts = JSON.parse(record.noteCounts) as Record<string, number>;
  const coinsTotal = coinDenominations.reduce((sum, key) => sum + (Number(largeBags[key]) || 0) * largeBagValues[key] + (Number(smallBags[key]) || 0) * smallBagValues[key], 0);
  const notesTotal = noteDenominations.reduce((sum, key) => sum + (Number(noteCounts[key]) || 0) * Number(key), 0);
  const theoreticalTotal = record.shift === "Manhã" ? 1250 : 1000 + Number(record.tillFunds || 0);
  const countedTotal = Math.round((coinsTotal + notesTotal + Number(record.looseCoins || 0) + Number(record.tillFunds || 0) + Number(record.invoices || 0)) * 100) / 100;
  const vaultTotal = Math.round((Number(record.bankCoins1 || 0) + Number(record.bankCoins2 || 0) + theoreticalTotal) * 100) / 100;
  return { ...record, largeBags, smallBags, noteCounts, theoreticalTotal, countedTotal, vaultTotal, difference: Math.round((countedTotal - vaultTotal) * 100) / 100 };
}

const lisbonDate = (date: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Lisbon", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
const editableDates = () => [lisbonDate(new Date()), lisbonDate(new Date(Date.now() - 86_400_000))];
const canEditDate = (role: "admin" | "editor" | "consulta", date: string) => role === "admin" || editableDates().includes(date);

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (auth.error) return auth.error;
  const month = new URL(request.url).searchParams.get("month") || "";
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return Response.json({ error: "Mês inválido." }, { status: 400 });
  const records = await getDb().select().from(vaultControls).where(like(vaultControls.controlDate, `${month}-%`)).orderBy(desc(vaultControls.controlDate), desc(vaultControls.id));
  return Response.json({ records: records.map(serializeRecord) });
}

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if (auth.error) return auth.error;
  try {
    const payload = await request.json() as Payload;
    const values = normalizePayload(payload);
    if (!canEditDate(auth.user.role, values.controlDate)) throw new Error("Só pode registar controlos de hoje ou de ontem.");
    const [record] = await getDb().insert(vaultControls).values({ ...values, createdBy: auth.user.id, createdByName: auth.user.name || auth.user.login }).returning();
    return Response.json({ record: serializeRecord(record) }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Não foi possível guardar o controlo." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireUser(request);
  if (auth.error) return auth.error;
  try {
    const payload = await request.json() as Payload & { id?: number };
    if (!payload.id) throw new Error("Registo obrigatório.");
    const [current] = await getDb().select().from(vaultControls).where(eq(vaultControls.id, payload.id)).limit(1);
    if (!current) return Response.json({ error: "Registo não encontrado." }, { status: 404 });
    if (!canEditDate(auth.user.role, current.controlDate)) throw new Error("Este registo já está bloqueado. Apenas o administrador o pode editar.");
    const values = normalizePayload(payload);
    if (!canEditDate(auth.user.role, values.controlDate)) throw new Error("Só pode alterar controlos de hoje ou de ontem.");
    const [record] = await getDb().update(vaultControls).set(values).where(eq(vaultControls.id, payload.id)).returning();
    if (!record) return Response.json({ error: "Registo não encontrado." }, { status: 404 });
    return Response.json({ record: serializeRecord(record) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Não foi possível atualizar o controlo." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireUser(request, ["admin"]);
  if (auth.error) return auth.error;
  const id = Number((await request.json() as { id?: number }).id);
  if (!id) return Response.json({ error: "Registo obrigatório." }, { status: 400 });
  const [deleted] = await getDb().delete(vaultControls).where(eq(vaultControls.id, id)).returning({ id: vaultControls.id });
  if (!deleted) return Response.json({ error: "Registo não encontrado." }, { status: 404 });
  return Response.json({ deleted: true, id });
}
