import { env } from "cloudflare:workers";
import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";

export const auditLog = sqliteTable("audit_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id"),
  action: text("action").notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  timestamp: text("timestamp").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_audit_log_entity").on(table.entityType, table.entityId),
  index("idx_audit_log_user").on(table.userId),
  index("idx_audit_log_timestamp").on(table.timestamp),
]);

let initialized = false;

export async function ensureAuditSchema() {
  if (initialized) return;
  if (!env.DB) throw new Error("Database unavailable");

  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      action TEXT NOT NULL,
      old_value TEXT,
      new_value TEXT,
      timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),

    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_audit_log_entity
      ON audit_log(entity_type, entity_id)`),

    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_audit_log_user
      ON audit_log(user_id)`),

    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp
      ON audit_log(timestamp)`),
  ]);

  initialized = true;
}
