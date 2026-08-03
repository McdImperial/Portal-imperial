import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const healthRecords = sqliteTable("health_records", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  profile: text("profile").notNull(),
  kind: text("kind").notNull(),
  recordedAt: text("recorded_at").notNull(),
  value1: real("value_1"),
  value2: real("value_2"),
  unit: text("unit"),
  title: text("title"),
  notes: text("notes"),
  duration: integer("duration"),
  sourceKey: text("source_key"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_health_records_profile_date").on(table.profile, table.recordedAt),
  uniqueIndex("idx_health_records_source_key").on(table.sourceKey),
]);
