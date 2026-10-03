import { getDb } from "./index";
import { haccpControls } from "./schema";
import { eq, and, gte, lte } from "drizzle-orm";

export type HaccpControl = typeof haccpControls.$inferInsert;
export type HaccpControlSelect = typeof haccpControls.$inferSelect;

export async function getControls(filters?: {
  date?: string;
  startDate?: string;
  endDate?: string;
  checkpoint?: string;
  status?: string;
}): Promise<HaccpControlSelect[]> {
  const db = getDb();
  let query = db.select().from(haccpControls);

  const conditions = [];

  if (filters?.date) {
    conditions.push(eq(haccpControls.date, filters.date));
  }
  if (filters?.startDate) {
    conditions.push(gte(haccpControls.date, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(haccpControls.date, filters.endDate));
  }
  if (filters?.checkpoint) {
    conditions.push(eq(haccpControls.checkpoint, filters.checkpoint));
  }
  if (filters?.status) {
    conditions.push(eq(haccpControls.status, filters.status));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  return query.orderBy(haccpControls.date);
}

export async function insertControl(control: HaccpControl): Promise<HaccpControlSelect> {
  const db = getDb();
  const [inserted] = await db.insert(haccpControls).values(control).returning();
  return inserted;
}

export async function updateControl(
  id: number,
  updates: Partial<HaccpControl>
): Promise<HaccpControlSelect> {
  const db = getDb();
  const [updated] = await db
    .update(haccpControls)
    .set(updates)
    .where(eq(haccpControls.id, id))
    .returning();
  return updated;
}

export async function deleteControl(id: number): Promise<void> {
  const db = getDb();
  await db.delete(haccpControls).where(eq(haccpControls.id, id));
}
