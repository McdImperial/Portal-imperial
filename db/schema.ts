import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  department: text("department").notNull(),
  area: text("area").notNull().default("Área geral"),
  due: text("due").notNull().default("Sem data"),
  assignee: text("assignee").notNull().default("TS"),
  assigneeName: text("assignee_name"),
  priority: text("priority").notNull().default("Média"),
  status: text("status").notNull().default("Por fazer"),
  position: integer("position").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const sharedFolders = sqliteTable("shared_folders", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  url: text("url").notNull(),
  fileCount: integer("file_count").notNull().default(0),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().default(""),
  login: text("login").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("consulta"),
  department: text("department").notNull().default(""),
  status: text("status").notNull().default("pendente"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  approvedAt: text("approved_at"),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id").notNull(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const cleaningInterventions = sqliteTable("cleaning_interventions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  department: text("department").notNull().default("qualidade"),
  area: text("area").notNull(),
  kind: text("kind").notNull().default("Limpeza"),
  scheduledDate: text("scheduled_date").notNull(),
  estimatedHours: real("estimated_hours").notNull(),
  resources: text("resources").notNull().default(""),
  status: text("status").notNull().default("Agendada"),
  createdBy: integer("created_by").notNull(),
  createdByName: text("created_by_name").notNull(),
  closedAt: text("closed_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_cleaning_interventions_scheduled_date").on(table.scheduledDate),
  index("idx_cleaning_interventions_department_date").on(table.department, table.scheduledDate),
]);

export const areaEvaluations = sqliteTable("area_evaluations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  month: text("month").notNull(),
  department: text("department").notNull(),
  area: text("area").notNull(),
  cleaningRating: text("cleaning_rating").notNull().default(""),
  maintenanceRating: text("maintenance_rating").notNull().default(""),
  evaluatedBy: integer("evaluated_by").notNull(),
  evaluatedByName: text("evaluated_by_name").notNull(),
  evaluatedAt: text("evaluated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("uidx_area_evaluations_month_department_area").on(table.month, table.department, table.area),
]);

export const talentCandidates = sqliteTable("talent_candidates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  contact: text("contact").notNull(),
  admissionDate: text("admission_date").notNull(),
  jobTitle: text("job_title").notNull().default(""),
  profile: text("profile").notNull().default("Classificar"),
  status: text("status").notNull().default("Recebida"),
  cvKey: text("cv_key").notNull(),
  cvName: text("cv_name").notNull(),
  coverLetterKey: text("cover_letter_key").notNull(),
  coverLetterName: text("cover_letter_name").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_talent_candidates_status_created").on(table.status, table.createdAt),
]);

export const billingDocuments = sqliteTable("billing_documents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  deliveryDate: text("delivery_date").notNull(),
  documentType: text("document_type").notNull(),
  fileKey: text("file_key").notNull().unique(),
  fileName: text("file_name").notNull(),
  contentType: text("content_type").notNull(),
  fileSize: integer("file_size").notNull(),
  uploadedBy: integer("uploaded_by").notNull(),
  uploadedByName: text("uploaded_by_name").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_billing_documents_delivery_type").on(table.deliveryDate, table.documentType),
]);

export const vaultControls = sqliteTable("vault_controls", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  controlDate: text("control_date").notNull(),
  shift: text("shift").notNull(),
  largeBags: text("large_bags").notNull().default("{}"),
  smallBags: text("small_bags").notNull().default("{}"),
  noteCounts: text("note_counts").notNull().default("{}"),
  looseCoins: real("loose_coins").notNull().default(0),
  tillFunds: real("till_funds").notNull().default(0),
  invoices: real("invoices").notNull().default(0),
  bankCoins1: real("bank_coins_1").notNull().default(0),
  bankCoins2: real("bank_coins_2").notNull().default(0),
  theoreticalTotal: real("theoretical_total").notNull().default(0),
  countedTotal: real("counted_total").notNull().default(0),
  vaultTotal: real("vault_total").notNull().default(0),
  difference: real("difference").notNull().default(0),
  deliveringManager: text("delivering_manager").notNull(),
  receivingManager: text("receiving_manager").notNull(),
  createdBy: integer("created_by").notNull(),
  createdByName: text("created_by_name").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_vault_controls_date_shift").on(table.controlDate, table.shift),
]);

export const coinOrders = sqliteTable("coin_orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderDate: text("order_date").notNull(),
  quantities: text("quantities").notNull().default("{}"),
  totalAmount: real("total_amount").notNull().default(0),
  depositAt: text("deposit_at"),
  responsibleManager: text("responsible_manager").notNull().default(""),
  orderManager: text("order_manager").notNull().default(""),
  depositManager: text("deposit_manager").notNull().default(""),
  createdBy: integer("created_by").notNull(),
  createdByName: text("created_by_name").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_coin_orders_date").on(table.orderDate),
  index("idx_coin_orders_deposit_at").on(table.depositAt),
]);

export const coinOrderSettings = sqliteTable("coin_order_settings", {
  id: integer("id").primaryKey(),
  minimumLargeBags: text("minimum_large_bags").notNull().default('{"0.05":1,"0.1":1,"0.2":1,"0.5":1,"1":1}'),
  updatedBy: integer("updated_by").notNull(),
  updatedByName: text("updated_by_name").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const alertDirectoryRecipients = sqliteTable("recipients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(), phone: text("phone").notNull().unique(),
  department: text("department").notNull().default(""), role: text("role").notNull().default(""),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`), updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("idx_recipients_active_name").on(table.active, table.name)]);

export const recipientGroups = sqliteTable("recipient_groups", {
  id: integer("id").primaryKey({ autoIncrement: true }), name: text("name").notNull().unique(),
  description: text("description").notNull().default(""), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const vaultInvoices = sqliteTable("vault_invoices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  invoiceDate: text("invoice_date").notNull(),
  entity: text("entity").notNull(),
  items: text("items").notNull().default("[]"),
  totalAmount: real("total_amount").notNull().default(0),
  rubric: text("rubric").notNull(),
  tag: text("tag").notNull(),
  beneficiary: text("beneficiary").notNull(),
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  pettyCash: integer("petty_cash", { mode: "boolean" }).notNull().default(false),
  imageName: text("image_name").notNull().default(""),
  createdBy: integer("created_by").notNull(),
  createdByName: text("created_by_name").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_vault_invoices_date").on(table.invoiceDate),
]);

export const recipientGroupMembers = sqliteTable("recipient_group_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  groupId: integer("group_id").notNull().references(() => recipientGroups.id, { onDelete: "cascade" }),
  recipientId: integer("recipient_id").notNull().references(() => alertDirectoryRecipients.id, { onDelete: "cascade" }),
}, (table) => [uniqueIndex("uidx_recipient_group_members_group_recipient").on(table.groupId, table.recipientId), index("idx_recipient_group_members_recipient").on(table.recipientId)]);

export const alertTemplates = sqliteTable("alert_templates", {
  id: integer("id").primaryKey({ autoIncrement: true }), name: text("name").notNull().unique(),
  category: text("category").notNull().default("Operacional"), message: text("message").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`), updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const alerts = sqliteTable("alerts", {
  id: integer("id").primaryKey({ autoIncrement: true }), name: text("name").notNull(), description: text("description").notNull().default(""),
  type: text("type").notNull().default("scheduled"), status: text("status").notNull().default("draft"), channel: text("channel").notNull().default("whatsapp"),
  templateId: integer("template_id").references(() => alertTemplates.id, { onDelete: "set null" }), message: text("message").notNull(),
  timezone: text("timezone").notNull().default("Europe/Lisbon"), lastRunAt: text("last_run_at"), nextRunAt: text("next_run_at"),
  createdBy: integer("created_by").notNull(), createdByName: text("created_by_name").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`), updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("idx_alerts_status_next_run").on(table.status, table.nextRunAt)]);

export const alertRecipientLinks = sqliteTable("alert_recipients", {
  id: integer("id").primaryKey({ autoIncrement: true }), alertId: integer("alert_id").notNull().references(() => alerts.id, { onDelete: "cascade" }),
  recipientId: integer("recipient_id").references(() => alertDirectoryRecipients.id, { onDelete: "cascade" }), groupId: integer("group_id").references(() => recipientGroups.id, { onDelete: "cascade" }),
}, (table) => [index("idx_alert_recipients_alert").on(table.alertId), uniqueIndex("uidx_alert_recipients_alert_recipient").on(table.alertId, table.recipientId), uniqueIndex("uidx_alert_recipients_alert_group").on(table.alertId, table.groupId)]);

export const alertSchedules = sqliteTable("alert_schedules", {
  id: integer("id").primaryKey({ autoIncrement: true }), alertId: integer("alert_id").notNull().unique().references(() => alerts.id, { onDelete: "cascade" }),
  frequency: text("frequency").notNull().default("once"), scheduledAt: text("scheduled_at"), timeOfDay: text("time_of_day"),
  weekDays: text("week_days").notNull().default("[]"), monthDay: integer("month_day"), anticipationMinutes: integer("anticipation_minutes").notNull().default(0),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
});

export const alertConditions = sqliteTable("alert_conditions", {
  id: integer("id").primaryKey({ autoIncrement: true }), alertId: integer("alert_id").notNull().unique().references(() => alerts.id, { onDelete: "cascade" }),
  source: text("source").notNull().default("manual"), field: text("field").notNull().default(""), operator: text("operator").notNull().default("equals"),
  expectedValue: text("expected_value").notNull().default(""), payloadPath: text("payload_path").notNull().default(""),
});

export const alertLogs = sqliteTable("alert_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }), alertId: integer("alert_id").references(() => alerts.id, { onDelete: "set null" }),
  alertName: text("alert_name").notNull(), recipientId: integer("recipient_id").references(() => alertDirectoryRecipients.id, { onDelete: "set null" }),
  recipientName: text("recipient_name").notNull(), recipientPhoneMasked: text("recipient_phone_masked").notNull(), scheduledAt: text("scheduled_at").notNull(),
  sentAt: text("sent_at"), status: text("status").notNull().default("pending"), provider: text("provider").notNull().default("simulation"),
  providerMessageId: text("provider_message_id"), idempotencyKey: text("idempotency_key").notNull().unique(), attempt: integer("attempt").notNull().default(1),
  errorCode: text("error_code"), errorMessage: text("error_message"), renderedMessage: text("rendered_message").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("idx_alert_logs_alert_created").on(table.alertId, table.createdAt), index("idx_alert_logs_status_created").on(table.status, table.createdAt)]);
