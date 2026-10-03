import { getDb } from "./index";
import { restaurantMetrics } from "./schema";
import { eq, and, gte, lte } from "drizzle-orm";

export type RestaurantMetric = typeof restaurantMetrics.$inferInsert;
export type RestaurantMetricSelect = typeof restaurantMetrics.$inferSelect;

export async function getMetrics(filters?: {
  date?: string;
  startDate?: string;
  endDate?: string;
  period?: string;
  shift?: string;
  metricKey?: string;
  managerId?: number;
}): Promise<RestaurantMetricSelect[]> {
  const db = getDb();
  let query = db.select().from(restaurantMetrics);

  const conditions = [];

  if (filters?.date) {
    conditions.push(eq(restaurantMetrics.date, filters.date));
  }
  if (filters?.startDate) {
    conditions.push(gte(restaurantMetrics.date, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(restaurantMetrics.date, filters.endDate));
  }
  if (filters?.period) {
    conditions.push(eq(restaurantMetrics.period, filters.period));
  }
  if (filters?.shift) {
    conditions.push(eq(restaurantMetrics.shift, filters.shift));
  }
  if (filters?.metricKey) {
    conditions.push(eq(restaurantMetrics.metricKey, filters.metricKey));
  }
  if (filters?.managerId) {
    conditions.push(eq(restaurantMetrics.managerId, filters.managerId));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  return query.orderBy(restaurantMetrics.date);
}

export async function insertMetric(metric: RestaurantMetric): Promise<RestaurantMetricSelect> {
  const db = getDb();
  const [inserted] = await db.insert(restaurantMetrics).values(metric).returning();
  return inserted;
}

export async function updateMetric(
  id: number,
  updates: Partial<RestaurantMetric>
): Promise<RestaurantMetricSelect> {
  const db = getDb();
  const [updated] = await db
    .update(restaurantMetrics)
    .set(updates)
    .where(eq(restaurantMetrics.id, id))
    .returning();
  return updated;
}

export async function deleteMetric(id: number): Promise<void> {
  const db = getDb();
  await db.delete(restaurantMetrics).where(eq(restaurantMetrics.id, id));
}
