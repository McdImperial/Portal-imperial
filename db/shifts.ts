import { env } from "cloudflare:workers";
import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";

export const shiftTypes = sqliteTable("shift_types", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  code: text("code").notNull().unique(),
  description: text("description"),
  color: text("color").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  qslFrequencyMinutes: integer("qsl_frequency_minutes"),
  enabled: integer("enabled").default(1),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const areas = sqliteTable("areas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  description: text("description"),
  color: text("color").notNull(),
  enabled: integer("enabled").default(1),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const qslPoints = sqliteTable("qsl_points", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  areaId: integer("area_id").notNull(),
  orderIndex: integer("order_index"),
  qrCodeData: text("qr_code_data"),
  enabled: integer("enabled").default(1),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_qsl_points_area_order").on(table.areaId, table.orderIndex),
]);

export const taskTemplates = sqliteTable("task_templates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  shiftTypeId: integer("shift_type_id").notNull(),
  areaId: integer("area_id").notNull(),
  orderIndex: integer("order_index"),
  scheduledTime: text("scheduled_time"),
  deadlineTime: text("deadline_time"),
  recurrence: text("recurrence").default("once"),
  criticality: text("criticality").default("normal"),
  responseType: text("response_type").default("yes_no"),
  photoRequired: integer("photo_required").default(0),
  photoOptional: integer("photo_optional").default(1),
  qrCodeRequired: integer("qr_code_required").default(0),
  qrCodeOptional: integer("qr_code_optional").default(0),
  notesRequired: integer("notes_required").default(0),
  notesOptional: integer("notes_optional").default(1),
  allowNa: integer("allow_na").default(1),
  assignedRole: text("assigned_role"),
  actionOnNonConformance: text("action_on_non_conformance"),
  enabled: integer("enabled").default(1),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_task_templates_shift_type").on(table.shiftTypeId),
  index("idx_task_templates_area").on(table.areaId),
  index("idx_task_templates_order").on(table.shiftTypeId, table.orderIndex),
]);

export const shifts = sqliteTable("shifts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  shiftTypeId: integer("shift_type_id").notNull(),
  shiftDate: text("shift_date").notNull(),
  startedAt: text("started_at"),
  endedAt: text("ended_at"),
  status: text("status").default("active"),
  expectedQslRounds: integer("expected_qsl_rounds"),
  qslFrequencyMinutes: integer("qsl_frequency_minutes"),
  notes: text("notes"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_shifts_user_date").on(table.userId, table.shiftDate),
  index("idx_shifts_status").on(table.status),
]);

export const taskExecutions = sqliteTable("task_executions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  shiftId: integer("shift_id").notNull(),
  taskTemplateId: integer("task_template_id").notNull(),
  userId: text("user_id").notNull(),
  taskDate: text("task_date").notNull(),
  scheduledTime: text("scheduled_time"),
  startedAt: text("started_at"),
  completedAt: text("completed_at"),
  status: text("status").default("pending"),
  value1: text("value_1"),
  value2: text("value_2"),
  notes: text("notes"),
  photoUrl: text("photo_url"),
  qrCodeData: text("qr_code_data"),
  qrCodeScannedAt: text("qr_code_scanned_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_task_executions_shift").on(table.shiftId),
  index("idx_task_executions_status").on(table.status),
  index("idx_task_executions_template").on(table.taskTemplateId),
]);

let initialized = false;

export async function ensureShiftsSchema() {
  if (initialized) return;
  if (!env.DB) throw new Error("Database unavailable");

  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS shift_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      code TEXT NOT NULL UNIQUE,
      description TEXT,
      color TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      qsl_frequency_minutes INTEGER,
      enabled INTEGER DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),

    env.DB.prepare(`CREATE TABLE IF NOT EXISTS areas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      color TEXT NOT NULL,
      enabled INTEGER DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),

    env.DB.prepare(`CREATE TABLE IF NOT EXISTS qsl_points (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      area_id INTEGER NOT NULL,
      order_index INTEGER,
      qr_code_data TEXT,
      enabled INTEGER DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),

    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_qsl_points_area_order
      ON qsl_points(area_id, order_index)`),

    env.DB.prepare(`CREATE TABLE IF NOT EXISTS task_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      shift_type_id INTEGER NOT NULL,
      area_id INTEGER NOT NULL,
      order_index INTEGER,
      scheduled_time TEXT,
      deadline_time TEXT,
      recurrence TEXT DEFAULT 'once',
      criticality TEXT DEFAULT 'normal',
      response_type TEXT DEFAULT 'yes_no',
      photo_required INTEGER DEFAULT 0,
      photo_optional INTEGER DEFAULT 1,
      qr_code_required INTEGER DEFAULT 0,
      qr_code_optional INTEGER DEFAULT 0,
      notes_required INTEGER DEFAULT 0,
      notes_optional INTEGER DEFAULT 1,
      allow_na INTEGER DEFAULT 1,
      assigned_role TEXT,
      action_on_non_conformance TEXT,
      enabled INTEGER DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),

    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_task_templates_shift_type
      ON task_templates(shift_type_id)`),

    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_task_templates_area
      ON task_templates(area_id)`),

    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_task_templates_order
      ON task_templates(shift_type_id, order_index)`),

    env.DB.prepare(`CREATE TABLE IF NOT EXISTS shifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      shift_type_id INTEGER NOT NULL,
      shift_date TEXT NOT NULL,
      started_at TEXT,
      ended_at TEXT,
      status TEXT DEFAULT 'active',
      expected_qsl_rounds INTEGER,
      qsl_frequency_minutes INTEGER,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),

    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_shifts_user_date
      ON shifts(user_id, shift_date)`),

    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_shifts_status
      ON shifts(status)`),

    env.DB.prepare(`CREATE TABLE IF NOT EXISTS task_executions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shift_id INTEGER NOT NULL,
      task_template_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      task_date TEXT NOT NULL,
      scheduled_time TEXT,
      started_at TEXT,
      completed_at TEXT,
      status TEXT DEFAULT 'pending',
      value_1 TEXT,
      value_2 TEXT,
      notes TEXT,
      photo_url TEXT,
      qr_code_data TEXT,
      qr_code_scanned_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),

    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_task_executions_shift
      ON task_executions(shift_id)`),

    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_task_executions_status
      ON task_executions(status)`),

    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_task_executions_template
      ON task_executions(task_template_id)`),
  ]);

  initialized = true;
}
