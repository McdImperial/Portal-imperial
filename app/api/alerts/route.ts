import { and, asc, desc, eq, gte, like, lte } from "drizzle-orm";
import { getDb } from "../../../db";
import { alertConditions, alertDirectoryRecipients, alertLogs, alertRecipientLinks, alertSchedules, alerts, alertTemplates, recipientGroupMembers, recipientGroups } from "../../../db/schema";
import { hasPermission, requirePermission, requireUser } from "../auth/_lib";
import { nextScheduledAt } from "../../../lib/alerts/scheduler";
import { providerStatus } from "../../../lib/alerts/providers";
import { executeAlert, resolveAlertRecipients } from "../../../lib/alerts/execution";
import type { AlertPayload } from "../../../lib/alerts/types";

const defaults = [
  { name: "Lembrete de tarefa", category: "Tarefas", message: "Olá {{nome}}, recordamos o alerta {{alerta}} previsto para {{data}}." },
  { name: "Prazo a terminar", category: "Prazos", message: "Olá {{nome}}, o prazo associado a {{alerta}} aproxima-se. Consulte o Portal Imperial." },
  { name: "Pedido pendente", category: "Pedidos", message: "Olá {{nome}}, existe um pedido pendente que necessita de acompanhamento." },
];
const validType = (value: string) => ["scheduled", "conditional", "anticipation"].includes(value);

async function ensureTemplates() {
  const db = getDb(); const existing = await db.select({ id: alertTemplates.id }).from(alertTemplates).limit(1);
  if (!existing.length) await db.insert(alertTemplates).values(defaults);
}

async function saveRelations(alertId: number, payload: AlertPayload) {
  const db = getDb();
  await db.delete(alertRecipientLinks).where(eq(alertRecipientLinks.alertId, alertId));
  const links: { alertId: number; recipientId?: number; groupId?: number }[] = [
    ...[...new Set(payload.recipientIds || [])].map((recipientId) => ({ alertId, recipientId })),
    ...[...new Set(payload.groupIds || [])].map((groupId) => ({ alertId, groupId })),
  ];
  if (links.length) await db.insert(alertRecipientLinks).values(links);
  await db.delete(alertSchedules).where(eq(alertSchedules.alertId, alertId));
  if (payload.type !== "conditional") await db.insert(alertSchedules).values({ alertId, frequency: payload.schedule?.frequency || "once", scheduledAt: payload.schedule?.scheduledAt || null, timeOfDay: payload.schedule?.timeOfDay || null, weekDays: JSON.stringify(payload.schedule?.weekDays || []), monthDay: payload.schedule?.monthDay || null, anticipationMinutes: payload.schedule?.anticipationMinutes || 0 });
  await db.delete(alertConditions).where(eq(alertConditions.alertId, alertId));
  if (payload.type === "conditional") await db.insert(alertConditions).values({ alertId, source: payload.condition?.source || "manual", field: payload.condition?.field || "", operator: payload.condition?.operator || "equals", expectedValue: payload.condition?.expectedValue || "", payloadPath: payload.condition?.payloadPath || "" });
}

export async function GET(request: Request) {
  const auth = await requireUser(request); if (auth.error) return auth.error;
  await ensureTemplates();
  const db = getDb(); const url = new URL(request.url); const resource = url.searchParams.get("resource") || "dashboard";
  if (resource === "recipients") return Response.json({ recipients: await db.select().from(alertDirectoryRecipients).orderBy(asc(alertDirectoryRecipients.name)), groups: await db.select().from(recipientGroups).orderBy(asc(recipientGroups.name)), members: await db.select().from(recipientGroupMembers) });
  if (resource === "templates") return Response.json({ templates: await db.select().from(alertTemplates).orderBy(asc(alertTemplates.name)) });
  if (resource === "logs") {
    const status = url.searchParams.get("status"); const from = url.searchParams.get("from"); const to = url.searchParams.get("to"); const search = url.searchParams.get("search");
    const filters = [status ? eq(alertLogs.status, status) : undefined, from ? gte(alertLogs.createdAt, from) : undefined, to ? lte(alertLogs.createdAt, `${to}T23:59:59`) : undefined, search ? like(alertLogs.alertName, `%${search.slice(0, 80)}%`) : undefined].filter(Boolean);
    return Response.json({ logs: await db.select().from(alertLogs).where(filters.length ? and(...filters as Parameters<typeof and>) : undefined).orderBy(desc(alertLogs.createdAt)).limit(300) });
  }
  const [alertRows, schedules, conditions, links, recipients, groups, recentLogs] = await Promise.all([
    db.select().from(alerts).orderBy(desc(alerts.updatedAt)), db.select().from(alertSchedules), db.select().from(alertConditions), db.select().from(alertRecipientLinks),
    db.select().from(alertDirectoryRecipients).orderBy(asc(alertDirectoryRecipients.name)), db.select().from(recipientGroups).orderBy(asc(recipientGroups.name)), db.select().from(alertLogs).orderBy(desc(alertLogs.createdAt)).limit(8),
  ]);
  const now = new Date(); const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  const monthLogs = await db.select().from(alertLogs).where(gte(alertLogs.createdAt, monthStart));
  return Response.json({ alerts: alertRows.map((item) => ({ ...item, schedule: schedules.find((entry) => entry.alertId === item.id), condition: conditions.find((entry) => entry.alertId === item.id), recipientIds: links.filter((entry) => entry.alertId === item.id && entry.recipientId).map((entry) => entry.recipientId), groupIds: links.filter((entry) => entry.alertId === item.id && entry.groupId).map((entry) => entry.groupId) })), recipients, groups, recentLogs, provider: providerStatus(), metrics: { active: alertRows.filter((item) => item.status === "active").length, sentMonth: monthLogs.filter((item) => item.status === "sent" || item.status === "simulated").length, pending: alertRows.filter((item) => item.status === "active" && item.nextRunAt).length, errors: monthLogs.filter((item) => item.status === "failed").length }, canManage: hasPermission(auth.user.role, "manage_alerts") });
}

export async function POST(request: Request) {
  const auth = await requirePermission(request, "manage_alerts"); if (auth.error) return auth.error;
  const url = new URL(request.url); const action = url.searchParams.get("action") || "create"; const body = await request.json() as Record<string, unknown>;
  const db = getDb();
  try {
    if (action === "recipient") { const name = String(body.name || "").trim(); const phone = String(body.phone || "").replace(/[^+\d]/g, ""); if (name.length < 2 || phone.replace(/\D/g, "").length < 9) throw new Error("Indique um nome e um contacto válidos."); const [entry] = await db.insert(alertDirectoryRecipients).values({ name, phone, department: String(body.department || ""), role: String(body.role || "") }).returning(); return Response.json({ recipient: entry }, { status: 201 }); }
    if (action === "group") { const name = String(body.name || "").trim(); if (name.length < 2) throw new Error("Indique o nome do grupo."); const [group] = await db.insert(recipientGroups).values({ name, description: String(body.description || "") }).returning(); const ids = Array.isArray(body.recipientIds) ? body.recipientIds.map(Number).filter(Boolean) : []; if (ids.length) await db.insert(recipientGroupMembers).values(ids.map((recipientId) => ({ groupId: group.id, recipientId }))); return Response.json({ group }, { status: 201 }); }
    if (action === "template") { const name = String(body.name || "").trim(); const message = String(body.message || "").trim(); if (!name || !message) throw new Error("Nome e mensagem são obrigatórios."); const [template] = await db.insert(alertTemplates).values({ name, category: String(body.category || "Operacional"), message }).returning(); return Response.json({ template }, { status: 201 }); }
    const payload = body as unknown as AlertPayload; if (!payload.name?.trim() || !payload.message?.trim() || !validType(payload.type)) throw new Error("Preencha o nome, tipo e mensagem do alerta.");
    const nextRunAt = payload.type === "conditional" ? null : nextScheduledAt(payload.schedule || {});
    const [created] = await db.insert(alerts).values({ name: payload.name.trim(), description: payload.description || "", type: payload.type, status: payload.status || "draft", channel: payload.channel || "whatsapp", templateId: payload.templateId || null, message: payload.message.trim(), nextRunAt, createdBy: auth.user.id, createdByName: auth.user.name || auth.user.login }).returning();
    await saveRelations(created.id, payload); return Response.json({ alert: created }, { status: 201 });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Não foi possível guardar." }, { status: 400 }); }
}

export async function PATCH(request: Request) {
  const auth = await requirePermission(request, "manage_alerts"); if (auth.error) return auth.error;
  const body = await request.json() as { id?: number; action?: string; payload?: AlertPayload } & AlertPayload; if (!body.id) return Response.json({ error: "Alerta obrigatório." }, { status: 400 });
  const db = getDb(); const [current] = await db.select().from(alerts).where(eq(alerts.id, body.id)).limit(1); if (!current) return Response.json({ error: "Alerta não encontrado." }, { status: 404 });
  if (body.action === "toggle") { const [alert] = await db.update(alerts).set({ status: current.status === "active" ? "paused" : "active", updatedAt: new Date().toISOString() }).where(eq(alerts.id, current.id)).returning(); return Response.json({ alert }); }
  if (body.action === "duplicate") { const [copy] = await db.insert(alerts).values({ name: `${current.name} (cópia)`, description: current.description, type: current.type, status: "draft", channel: current.channel, templateId: current.templateId, message: current.message, timezone: current.timezone, nextRunAt: current.nextRunAt, createdBy: auth.user.id, createdByName: auth.user.name || auth.user.login }).returning(); const links = await db.select().from(alertRecipientLinks).where(eq(alertRecipientLinks.alertId, current.id)); if (links.length) await db.insert(alertRecipientLinks).values(links.map((link) => ({ alertId: copy.id, recipientId: link.recipientId, groupId: link.groupId }))); return Response.json({ alert: copy }); }
  if (body.action === "test") { const recipients = await resolveAlertRecipients(current.id); if (!recipients.length) return Response.json({ error: "Adicione pelo menos um destinatário ativo." }, { status: 400 }); const results = await executeAlert(current, recipients.slice(0, 1), new Date().toISOString(), true); return Response.json({ tested: true, results, simulation: providerStatus().simulation }); }
  const payload = body.payload || body; if (!payload.name?.trim() || !payload.message?.trim() || !validType(payload.type)) return Response.json({ error: "Dados inválidos." }, { status: 400 });
  const [alert] = await db.update(alerts).set({ name: payload.name.trim(), description: payload.description || "", type: payload.type, status: payload.status || current.status, channel: payload.channel || "whatsapp", templateId: payload.templateId || null, message: payload.message.trim(), nextRunAt: payload.type === "conditional" ? null : nextScheduledAt(payload.schedule || {}), updatedAt: new Date().toISOString() }).where(eq(alerts.id, current.id)).returning();
  await saveRelations(alert.id, payload); return Response.json({ alert });
}

export async function DELETE(request: Request) {
  const auth = await requireUser(request, ["admin"]); if (auth.error) return auth.error;
  const id = Number((await request.json() as { id?: number }).id); if (!id) return Response.json({ error: "Alerta obrigatório." }, { status: 400 });
  await getDb().delete(alerts).where(eq(alerts.id, id)); return Response.json({ deleted: true });
}
