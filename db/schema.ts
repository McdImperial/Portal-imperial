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

export const healthMetrics = sqliteTable("health_metrics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  profile: text("profile").notNull(),
  groupName: text("group_name").notNull(),
  metricKey: text("metric_key").notNull(),
  metricLabel: text("metric_label").notNull(),
  recordedAt: text("recorded_at").notNull(),
  value: real("value").notNull(),
  unit: text("unit"),
  sourceKey: text("source_key").notNull(),
  sourceUrl: text("source_url"),
  note: text("note"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("idx_health_metrics_source_key").on(table.sourceKey),
  index("idx_health_metrics_profile_group_metric_date").on(table.profile, table.groupName, table.metricKey, table.recordedAt),
]);
