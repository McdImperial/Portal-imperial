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

export const financeExpenses = sqliteTable("finance_expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  month: text("month").notNull(), name: text("name").notNull(), amount: real("amount").notNull(),
  paymentType: text("payment_type").notNull(), entity: text("entity"), reference: text("reference"), dueDate: text("due_date"),
  status: text("status").notNull().default("Pendente"), bank: text("bank").notNull(), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("idx_finance_expenses_month_due").on(table.month, table.dueDate)]);

// ============================================
// RESTAURANT PORTAL TABLES (Portal Imperial)
// ============================================

export const restaurantMetrics = sqliteTable("restaurant_metrics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  period: text("period").notNull(), // "daily" | "weekly" | "monthly"
  shift: text("shift"), // "morning" | "afternoon" | "night" | null for daily
  daypart: text("daypart"), // "breakfast" | "lunch" | "dinner" | null
  managerId: integer("manager_id"),
  area: text("area"), // "kitchen" | "dining" | "delivery" | null
  metricKey: text("metric_key").notNull(), // "r2p" | "sales" | "gcs" | "productivity"
  metricLabel: text("metric_label").notNull(),
  value: real("value").notNull(),
  target: real("target"),
  variance: real("variance"), // value - target
  unit: text("unit"),
  status: text("status"), // "above" | "on_target" | "below"
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_restaurant_metrics_date_key").on(table.date, table.metricKey),
  index("idx_restaurant_metrics_period_shift").on(table.period, table.shift),
]);

export const deliveryOrders = sqliteTable("delivery_orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  orderId: text("order_id").notNull().unique(),
  platform: text("platform").notNull(), // "ubereats" | "deliveroo" | "glovo" | "wolt"
  status: text("status").notNull(), // "pending" | "confirmed" | "cooking" | "ready" | "dispatched" | "delivered"
  prepTime: integer("prep_time"), // minutos
  deliveryTime: integer("delivery_time"), // minutos
  totalTime: integer("total_time"), // minutos
  amount: real("amount"),
  distance: real("distance"), // km
  csat: integer("csat"), // customer satisfaction 1-5
  issues: text("issues"), // comma-separated
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_delivery_orders_date_platform").on(table.date, table.platform),
  index("idx_delivery_orders_status").on(table.status),
]);

export const haccpControls = sqliteTable("haccp_controls", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  time: text("time"), // HH:MM format
  checkpoint: text("checkpoint").notNull(), // "receiving" | "storage" | "prep" | "cooking" | "cooling" | "serving"
  parameter: text("parameter").notNull(), // "temperature" | "time" | "humidity" | "cleanliness"
  value: real("value"),
  unit: text("unit"), // "°C" | "%" | "minutes"
  critical_limit: real("critical_limit"),
  corrective_action: text("corrective_action"),
  status: text("status"), // "ok" | "warning" | "deviation"
  recordedBy: text("recorded_by"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_haccp_controls_date_checkpoint").on(table.date, table.checkpoint),
  index("idx_haccp_controls_status").on(table.status),
]);

export const audits = sqliteTable("audits", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  auditType: text("audit_type").notNull(), // "internal" | "external" | "compliance"
  category: text("category").notNull(), // "kitchen" | "dining" | "storage" | "hygiene" | "staff"
  score: real("score"), // 0-100
  maxScore: integer("max_score").default(100),
  percentage: real("percentage"), // score/maxScore * 100
  status: text("status"), // "passed" | "failed" | "pending_review"
  auditedBy: text("audited_by"),
  notes: text("notes"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_audits_date_category").on(table.date, table.category),
  index("idx_audits_status").on(table.status),
]);

export const auditOpportunities = sqliteTable("audit_opportunities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  auditId: integer("audit_id"),
  date: text("date").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(), // "high" | "medium" | "low"
  category: text("category"),
  priority: integer("priority"), // 1-5
  status: text("status").notNull().default("open"), // "open" | "in_progress" | "closed"
  assignedTo: text("assigned_to"),
  dueDate: text("due_date"),
  resolution: text("resolution"),
  closedAt: text("closed_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_audit_opportunities_date_severity").on(table.date, table.severity),
  index("idx_audit_opportunities_status").on(table.status),
]);

export const pacActions = sqliteTable("pac_actions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  description: text("description").notNull(),
  source: text("source"), // "audit" | "internal" | "external"
  sourceId: integer("source_id"),
  priority: integer("priority"), // 1-5
  deadline: text("deadline"),
  assignedTo: text("assigned_to"),
  status: text("status").notNull().default("open"), // "open" | "in_progress" | "completed" | "overdue"
  progress: integer("progress").default(0), // 0-100
  notes: text("notes"),
  completedAt: text("completed_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_pac_actions_deadline_status").on(table.deadline, table.status),
  index("idx_pac_actions_priority").on(table.priority),
]);

export const staff = sqliteTable("staff", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").unique(),
  phone: text("phone"),
  role: text("role").notNull(), // "gerente" | "supervisor" | "chef" | "cook" | "waiter" | "delivery" | "rh" | "admin"
  department: text("department"), // "kitchen" | "dining" | "delivery" | "admin"
  status: text("status").notNull().default("active"), // "active" | "inactive" | "on_leave"
  hireDate: text("hire_date"),
  manager: text("manager"),
  certifications: text("certifications"), // comma-separated
  notes: text("notes"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_staff_role").on(table.role),
  index("idx_staff_status").on(table.status),
]);

export const schedules = sqliteTable("schedules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  staffId: integer("staff_id").notNull(),
  date: text("date").notNull(),
  startTime: text("start_time"), // HH:MM
  endTime: text("end_time"), // HH:MM
  shift: text("shift"), // "morning" | "afternoon" | "night"
  daypart: text("daypart"), // "breakfast" | "lunch" | "dinner"
  area: text("area"), // "kitchen" | "dining" | "delivery"
  notes: text("notes"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_schedules_staff_date").on(table.staffId, table.date),
  index("idx_schedules_date").on(table.date),
]);

export const trainingCourses = sqliteTable("training_courses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"), // "food_safety" | "customer_service" | "technical" | "leadership"
  duration: integer("duration"), // horas
  mandatory: integer("mandatory").default(0), // 0 | 1
  expiryMonths: integer("expiry_months"), // null se não expira
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_training_courses_category").on(table.category),
]);

export const trainingProgress = sqliteTable("training_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  staffId: integer("staff_id").notNull(),
  courseId: integer("course_id").notNull(),
  startDate: text("start_date"),
  completionDate: text("completion_date"),
  status: text("status").notNull().default("in_progress"), // "in_progress" | "completed" | "failed" | "pending"
  score: real("score"), // 0-100
  certificationExpiry: text("certification_expiry"),
  notes: text("notes"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_training_progress_staff_course").on(table.staffId, table.courseId),
  index("idx_training_progress_status").on(table.status),
]);

export const costs = sqliteTable("costs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  month: text("month").notNull(), // YYYY-MM
  category: text("category").notNull(), // "food" | "labor" | "utilities" | "rent" | "marketing" | "other"
  description: text("description"),
  amount: real("amount").notNull(),
  budget: real("budget"),
  variance: real("variance"), // amount - budget
  status: text("status"), // "actual" | "estimated"
  notes: text("notes"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_costs_month_category").on(table.month, table.category),
  index("idx_costs_date").on(table.date),
]);

export const maintenance = sqliteTable("maintenance", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  equipmentName: text("equipment_name").notNull(),
  equipmentId: text("equipment_id"),
  area: text("area"), // "kitchen" | "storage" | "dining"
  type: text("type").notNull(), // "preventive" | "corrective" | "inspection"
  description: text("description").notNull(),
  technician: text("technician"),
  status: text("status").notNull(), // "completed" | "scheduled" | "in_progress" | "urgent"
  cost: real("cost"),
  nextScheduled: text("next_scheduled"),
  notes: text("notes"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_maintenance_date_status").on(table.date, table.status),
  index("idx_maintenance_equipment").on(table.equipmentId),
]);
