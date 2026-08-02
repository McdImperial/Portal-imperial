import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
