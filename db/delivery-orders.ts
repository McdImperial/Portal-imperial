import { getDb } from "./index";
import { deliveryOrders } from "./schema";
import { eq, and, gte, lte } from "drizzle-orm";

export type DeliveryOrder = typeof deliveryOrders.$inferInsert;
export type DeliveryOrderSelect = typeof deliveryOrders.$inferSelect;

export async function getOrders(filters?: {
  date?: string;
  startDate?: string;
  endDate?: string;
  platform?: string;
  status?: string;
}): Promise<DeliveryOrderSelect[]> {
  const db = getDb();
  let query = db.select().from(deliveryOrders);

  const conditions = [];

  if (filters?.date) {
    conditions.push(eq(deliveryOrders.date, filters.date));
  }
  if (filters?.startDate) {
    conditions.push(gte(deliveryOrders.date, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(deliveryOrders.date, filters.endDate));
  }
  if (filters?.platform) {
    conditions.push(eq(deliveryOrders.platform, filters.platform));
  }
  if (filters?.status) {
    conditions.push(eq(deliveryOrders.status, filters.status));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  return query.orderBy(deliveryOrders.date);
}

export async function insertOrder(order: DeliveryOrder): Promise<DeliveryOrderSelect> {
  const db = getDb();
  const [inserted] = await db.insert(deliveryOrders).values(order).returning();
  return inserted;
}

export async function updateOrder(
  id: number,
  updates: Partial<DeliveryOrder>
): Promise<DeliveryOrderSelect> {
  const db = getDb();
  const [updated] = await db
    .update(deliveryOrders)
    .set(updates)
    .where(eq(deliveryOrders.id, id))
    .returning();
  return updated;
}

export async function deleteOrder(id: number): Promise<void> {
  const db = getDb();
  await db.delete(deliveryOrders).where(eq(deliveryOrders.id, id));
}
