import { env } from "cloudflare:workers";
import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";

export const qslRounds = sqliteTable("qsl_rounds", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  shiftId: integer("shift_id").notNull(),
  roundNumber: integer("round_number").notNull(),
  scheduledTime: text("scheduled_time").notNull(),
  status: text("status").default("pending"),
  startedAt: text("started_at"),
  completedAt: text("completed_at"),
  durationMinutes: integer("duration_minutes"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_qsl_rounds_shift").on(table.shiftId),
  index("idx_qsl_rounds_status").on(table.status),
]);

export const qslCheckpoints = sqliteTable("qsl_checkpoints", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  qslRoundId: integer("qsl_round_id").notNull(),
  qslPointId: integer("qsl_point_id").notNull(),
  status: text("status").default("pending"),
  scannedAt: text("scanned_at"),
  photoUrl: text("photo_url"),
  notes: text("notes"),
  issues: text("issues"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_qsl_checkpoints_round").on(table.qslRoundId),
  index("idx_qsl_checkpoints_point").on(table.qslPointId),
  index("idx_qsl_checkpoints_status").on(table.status),
]);

let initialized = false;

export async function ensureQslSchema() {
  if (initialized) return;
  if (!env.DB) throw new Error("Database unavailable");

  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS qsl_rounds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shift_id INTEGER NOT NULL,
      round_number INTEGER NOT NULL,
      scheduled_time TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      started_at TEXT,
      completed_at TEXT,
      duration_minutes INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),

    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_qsl_rounds_shift
      ON qsl_rounds(shift_id)`),

    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_qsl_rounds_status
      ON qsl_rounds(status)`),

    env.DB.prepare(`CREATE TABLE IF NOT EXISTS qsl_checkpoints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      qsl_round_id INTEGER NOT NULL,
      qsl_point_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      scanned_at TEXT,
      photo_url TEXT,
      notes TEXT,
      issues TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),

    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_qsl_checkpoints_round
      ON qsl_checkpoints(qsl_round_id)`),

    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_qsl_checkpoints_point
      ON qsl_checkpoints(qsl_point_id)`),

    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_qsl_checkpoints_status
      ON qsl_checkpoints(status)`),
  ]);

  initialized = true;
}
