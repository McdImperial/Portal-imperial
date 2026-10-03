import { getDb } from "./index";
import { audits, auditOpportunities, pacActions } from "./schema";
import { eq, and, gte, lte } from "drizzle-orm";

export type Audit = typeof audits.$inferInsert;
export type AuditSelect = typeof audits.$inferSelect;
export type AuditOpportunity = typeof auditOpportunities.$inferInsert;
export type AuditOpportunitySelect = typeof auditOpportunities.$inferSelect;
export type PacAction = typeof pacActions.$inferInsert;
export type PacActionSelect = typeof pacActions.$inferSelect;

// Audits
export async function getAudits(filters?: {
  date?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  status?: string;
}): Promise<AuditSelect[]> {
  const db = getDb();
  let query = db.select().from(audits);

  const conditions = [];
  if (filters?.date) conditions.push(eq(audits.date, filters.date));
  if (filters?.startDate) conditions.push(gte(audits.date, filters.startDate));
  if (filters?.endDate) conditions.push(lte(audits.date, filters.endDate));
  if (filters?.category) conditions.push(eq(audits.category, filters.category));
  if (filters?.status) conditions.push(eq(audits.status, filters.status));

  if (conditions.length > 0) query = query.where(and(...conditions));
  return query.orderBy(audits.date);
}

export async function insertAudit(audit: Audit): Promise<AuditSelect> {
  const db = getDb();
  const [inserted] = await db.insert(audits).values(audit).returning();
  return inserted;
}

export async function updateAudit(id: number, updates: Partial<Audit>): Promise<AuditSelect> {
  const db = getDb();
  const [updated] = await db
    .update(audits)
    .set(updates)
    .where(eq(audits.id, id))
    .returning();
  return updated;
}

// Audit Opportunities
export async function getOpportunities(filters?: {
  date?: string;
  startDate?: string;
  endDate?: string;
  severity?: string;
  status?: string;
}): Promise<AuditOpportunitySelect[]> {
  const db = getDb();
  let query = db.select().from(auditOpportunities);

  const conditions = [];
  if (filters?.date) conditions.push(eq(auditOpportunities.date, filters.date));
  if (filters?.startDate) conditions.push(gte(auditOpportunities.date, filters.startDate));
  if (filters?.endDate) conditions.push(lte(auditOpportunities.date, filters.endDate));
  if (filters?.severity) conditions.push(eq(auditOpportunities.severity, filters.severity));
  if (filters?.status) conditions.push(eq(auditOpportunities.status, filters.status));

  if (conditions.length > 0) query = query.where(and(...conditions));
  return query.orderBy(auditOpportunities.date);
}

export async function insertOpportunity(
  opportunity: AuditOpportunity
): Promise<AuditOpportunitySelect> {
  const db = getDb();
  const [inserted] = await db.insert(auditOpportunities).values(opportunity).returning();
  return inserted;
}

export async function updateOpportunity(
  id: number,
  updates: Partial<AuditOpportunity>
): Promise<AuditOpportunitySelect> {
  const db = getDb();
  const [updated] = await db
    .update(auditOpportunities)
    .set(updates)
    .where(eq(auditOpportunities.id, id))
    .returning();
  return updated;
}

// PAC Actions
export async function getPacActions(filters?: {
  date?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  priority?: number;
}): Promise<PacActionSelect[]> {
  const db = getDb();
  let query = db.select().from(pacActions);

  const conditions = [];
  if (filters?.date) conditions.push(eq(pacActions.date, filters.date));
  if (filters?.startDate) conditions.push(gte(pacActions.date, filters.startDate));
  if (filters?.endDate) conditions.push(lte(pacActions.date, filters.endDate));
  if (filters?.status) conditions.push(eq(pacActions.status, filters.status));
  if (filters?.priority) conditions.push(eq(pacActions.priority, filters.priority));

  if (conditions.length > 0) query = query.where(and(...conditions));
  return query.orderBy(pacActions.deadline);
}

export async function insertPacAction(action: PacAction): Promise<PacActionSelect> {
  const db = getDb();
  const [inserted] = await db.insert(pacActions).values(action).returning();
  return inserted;
}

export async function updatePacAction(id: number, updates: Partial<PacAction>): Promise<PacActionSelect> {
  const db = getDb();
  const [updated] = await db
    .update(pacActions)
    .set(updates)
    .where(eq(pacActions.id, id))
    .returning();
  return updated;
}
