import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "../../db";
import { alertDirectoryRecipients, alertLogs, alertRecipientLinks, recipientGroupMembers } from "../../db/schema";
import { renderAlertTemplate } from "./template";
import { executionKey } from "./scheduler";
import { sendN8n, sendWhatsApp } from "./providers";

const maskPhone = (phone: string) => phone.length < 5 ? "••••" : `${phone.slice(0, 3)}••••${phone.slice(-2)}`;

export async function resolveAlertRecipients(alertId: number) {
  const db = getDb();
  const links = await db.select().from(alertRecipientLinks).where(eq(alertRecipientLinks.alertId, alertId));
  const direct = links.flatMap((link) => link.recipientId ? [link.recipientId] : []);
  const groupIds = links.flatMap((link) => link.groupId ? [link.groupId] : []);
  const members = groupIds.length ? await db.select().from(recipientGroupMembers).where(inArray(recipientGroupMembers.groupId, groupIds)) : [];
  const ids = [...new Set([...direct, ...members.map((member) => member.recipientId)])];
  return ids.length ? db.select().from(alertDirectoryRecipients).where(and(inArray(alertDirectoryRecipients.id, ids), eq(alertDirectoryRecipients.active, true))) : [];
}

export async function executeAlert(alert: { id: number; name: string; message: string; channel: string }, recipients: { id: number; name: string; phone: string }[], scheduledAt = new Date().toISOString(), test = false) {
  const db = getDb(); const results = [];
  for (const recipient of recipients) {
    const key = executionKey(alert.id, recipient.id, test ? `${scheduledAt}:test:${crypto.randomUUID()}` : scheduledAt);
    const rendered = renderAlertTemplate(alert.message, { nome: recipient.name, data: new Date().toLocaleDateString("pt-PT", { timeZone: "Europe/Lisbon" }), alerta: alert.name });
    const [existing] = await db.select({ id: alertLogs.id, status: alertLogs.status }).from(alertLogs).where(eq(alertLogs.idempotencyKey, key)).limit(1);
    if (existing) { results.push({ recipientId: recipient.id, ok: existing.status !== "failed", mode: "skipped" }); continue; }
    try {
      let delivery: { provider: string; id: string } | null = null; let lastError: unknown; let attempts = 0;
      for (let attempt = 1; attempt <= 3 && !delivery; attempt += 1) {
        attempts = attempt;
        try { delivery = alert.channel === "n8n" ? await sendN8n({ alert, recipient, message: rendered, scheduledAt }) : await sendWhatsApp(recipient.phone, rendered); }
        catch (error) { lastError = error; if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 150)); }
      }
      if (!delivery) throw lastError instanceof Error ? lastError : new Error("O fornecedor não aceitou o envio.");
      if (alert.channel === "both") await sendN8n({ alert, recipient, message: rendered, scheduledAt });
      await db.insert(alertLogs).values({ alertId: alert.id, alertName: alert.name, recipientId: recipient.id, recipientName: recipient.name, recipientPhoneMasked: maskPhone(recipient.phone), scheduledAt, sentAt: new Date().toISOString(), status: delivery.provider === "simulation" ? "simulated" : "sent", provider: delivery.provider, providerMessageId: delivery.id, idempotencyKey: key, attempt: attempts, renderedMessage: rendered });
      results.push({ recipientId: recipient.id, ok: true, mode: delivery.provider });
    } catch (error) {
      await db.insert(alertLogs).values({ alertId: alert.id, alertName: alert.name, recipientId: recipient.id, recipientName: recipient.name, recipientPhoneMasked: maskPhone(recipient.phone), scheduledAt, status: "failed", provider: "whatsapp", idempotencyKey: key, renderedMessage: rendered, errorMessage: error instanceof Error ? error.message : "Erro de envio" });
      results.push({ recipientId: recipient.id, ok: false });
    }
  }
  return results;
}
