export const ALERT_TIMEZONE = "Europe/Lisbon";

export function nextScheduledAt(schedule: { frequency?: string; scheduledAt?: string | null; timeOfDay?: string | null; monthDay?: number | null }, from = new Date()) {
  if (schedule.frequency === "once" && schedule.scheduledAt) return new Date(schedule.scheduledAt).toISOString();
  const [hour, minute] = (schedule.timeOfDay || "09:00").split(":").map(Number);
  const candidate = new Date(from); candidate.setUTCSeconds(0, 0); candidate.setUTCHours(hour || 0, minute || 0);
  if (candidate <= from) candidate.setUTCDate(candidate.getUTCDate() + (schedule.frequency === "weekly" ? 7 : 1));
  if (schedule.frequency === "monthly") { candidate.setUTCMonth(candidate.getUTCMonth() + 1); candidate.setUTCDate(Math.max(1, Math.min(28, schedule.monthDay || 1))); }
  return candidate.toISOString();
}

export function executionKey(alertId: number, recipientId: number, scheduledAt: string) { return `${alertId}:${recipientId}:${scheduledAt}`; }
