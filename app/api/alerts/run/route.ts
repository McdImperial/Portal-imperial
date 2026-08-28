import { env } from "cloudflare:workers";
import { and, eq, lte } from "drizzle-orm";
import { getDb } from "../../../../db";
import { alerts, alertSchedules } from "../../../../db/schema";
import { executeAlert, resolveAlertRecipients } from "../../../../lib/alerts/execution";
import { nextScheduledAt } from "../../../../lib/alerts/scheduler";

export async function POST(request: Request) {
  const secret = (env as unknown as { ALERTS_SCHEDULER_SECRET?: string }).ALERTS_SCHEDULER_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return Response.json({ error: "Não autorizado." }, { status: 401 });
  const db = getDb(); const now = new Date().toISOString(); const due = await db.select().from(alerts).where(and(eq(alerts.status, "active"), lte(alerts.nextRunAt, now)));
  const completed = [];
  for (const alert of due) {
    const recipients = await resolveAlertRecipients(alert.id); const results = await executeAlert(alert, recipients, alert.nextRunAt || now);
    const [schedule] = await db.select().from(alertSchedules).where(eq(alertSchedules.alertId, alert.id)).limit(1);
    const nextRunAt = schedule?.frequency === "once" ? null : nextScheduledAt(schedule || {}, new Date(now));
    await db.update(alerts).set({ lastRunAt: now, nextRunAt, status: nextRunAt ? alert.status : "paused", updatedAt: now }).where(eq(alerts.id, alert.id));
    completed.push({ alertId: alert.id, recipients: results.length });
  }
  return Response.json({ processedAt: now, completed });
}
