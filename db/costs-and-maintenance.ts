import { getDb } from "./index";
import { costs, maintenance } from "./schema";
import { eq, and, gte, lte } from "drizzle-orm";

export type Cost = typeof costs.$inferInsert;
export type CostSelect = typeof costs.$inferSelect;
export type Maintenance = typeof maintenance.$inferInsert;
export type MaintenanceSelect = typeof maintenance.$inferSelect;

// Costs
export async function getCosts(filters?: {
  month?: string;
  startMonth?: string;
  endMonth?: string;
  category?: string;
  status?: string;
}): Promise<CostSelect[]> {
  const db = getDb();
  let query = db.select().from(costs);

  const conditions = [];
  if (filters?.month) conditions.push(eq(costs.month, filters.month));
  if (filters?.startMonth) conditions.push(gte(costs.month, filters.startMonth));
  if (filters?.endMonth) conditions.push(lte(costs.month, filters.endMonth));
  if (filters?.category) conditions.push(eq(costs.category, filters.category));
  if (filters?.status) conditions.push(eq(costs.status, filters.status));

  if (conditions.length > 0) query = query.where(and(...conditions));
  return query.orderBy(costs.date);
}

export async function insertCost(cost: Cost): Promise<CostSelect> {
  const db = getDb();
  const [inserted] = await db.insert(costs).values(cost).returning();
  return inserted;
}

export async function updateCost(id: number, updates: Partial<Cost>): Promise<CostSelect> {
  const db = getDb();
  const [updated] = await db
    .update(costs)
    .set(updates)
    .where(eq(costs.id, id))
    .returning();
  return updated;
}

// Maintenance
export async function getMaintenance(filters?: {
  date?: string;
  status?: string;
  equipmentId?: string;
  area?: string;
}): Promise<MaintenanceSelect[]> {
  const db = getDb();
  let query = db.select().from(maintenance);

  const conditions = [];
  if (filters?.date) conditions.push(eq(maintenance.date, filters.date));
  if (filters?.status) conditions.push(eq(maintenance.status, filters.status));
  if (filters?.equipmentId) conditions.push(eq(maintenance.equipmentId, filters.equipmentId));
  if (filters?.area) conditions.push(eq(maintenance.area, filters.area));

  if (conditions.length > 0) query = query.where(and(...conditions));
  return query.orderBy(maintenance.date);
}

export async function insertMaintenance(record: Maintenance): Promise<MaintenanceSelect> {
  const db = getDb();
  const [inserted] = await db.insert(maintenance).values(record).returning();
  return inserted;
}

export async function updateMaintenance(
  id: number,
  updates: Partial<Maintenance>
): Promise<MaintenanceSelect> {
  const db = getDb();
  const [updated] = await db
    .update(maintenance)
    .set(updates)
    .where(eq(maintenance.id, id))
    .returning();
  return updated;
}
