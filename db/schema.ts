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
