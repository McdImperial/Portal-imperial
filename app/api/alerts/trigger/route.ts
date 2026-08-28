import { env } from "cloudflare:workers";
import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { alertConditions, alerts } from "../../../../db/schema";
import { executeAlert, resolveAlertRecipients } from "../../../../lib/alerts/execution";

const matches = (actual: string, operator: string, expected: string) => operator === "equals" ? actual === expected : operator === "not_equals" ? actual !== expected : operator === "contains" ? actual.includes(expected) : operator === "greater_than" ? Number(actual) > Number(expected) : false;

export async function POST(request: Request) {
  const secret = (env as unknown as { ALERTS_SCHEDULER_SECRET?: string }).ALERTS_SCHEDULER_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return Response.json({ error: "Não autorizado." }, { status: 401 });
  const body = await request.json() as { source?: string; values?: Record<string, string | number> };
  const db = getDb(); const rows = await db.select({ alert: alerts, condition: alertConditions }).from(alerts).innerJoin(alertConditions, eq(alertConditions.alertId, alerts.id)).where(and(eq(alerts.status, "active"), eq(alerts.type, "conditional")));
  const completed = [];
  for (const row of rows) {
    if (row.condition.source !== (body.source || "manual")) continue;
    const actual = String(body.values?.[row.condition.field] ?? "");
    if (!matches(actual, row.condition.operator, row.condition.expectedValue)) continue;
    const recipients = await resolveAlertRecipients(row.alert.id); const scheduledAt = new Date().toISOString();
    const results = await executeAlert(row.alert, recipients, scheduledAt);
    await db.update(alerts).set({ lastRunAt: scheduledAt, updatedAt: scheduledAt }).where(eq(alerts.id, row.alert.id));
    completed.push({ alertId: row.alert.id, recipients: results.length });
  }
  return Response.json({ processedAt: new Date().toISOString(), completed });
}
