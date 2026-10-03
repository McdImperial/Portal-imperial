CREATE TABLE `restaurant_metrics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`period` text NOT NULL,
	`shift` text,
	`daypart` text,
	`manager_id` integer,
	`area` text,
	`metric_key` text NOT NULL,
	`metric_label` text NOT NULL,
	`value` real NOT NULL,
	`target` real,
	`variance` real,
	`unit` text,
	`status` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_restaurant_metrics_date_key` ON `restaurant_metrics` (`date`,`metric_key`);
--> statement-breakpoint
CREATE INDEX `idx_restaurant_metrics_period_shift` ON `restaurant_metrics` (`period`,`shift`);
--> statement-breakpoint
CREATE TABLE `delivery_orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`order_id` text NOT NULL UNIQUE,
	`platform` text NOT NULL,
	`status` text NOT NULL,
	`prep_time` integer,
	`delivery_time` integer,
	`total_time` integer,
	`amount` real,
	`distance` real,
	`csat` integer,
	`issues` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_delivery_orders_date_platform` ON `delivery_orders` (`date`,`platform`);
--> statement-breakpoint
CREATE INDEX `idx_delivery_orders_status` ON `delivery_orders` (`status`);
--> statement-breakpoint
CREATE TABLE `haccp_controls` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`time` text,
	`checkpoint` text NOT NULL,
	`parameter` text NOT NULL,
	`value` real,
	`unit` text,
	`critical_limit` real,
	`corrective_action` text,
	`status` text,
	`recorded_by` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_haccp_controls_date_checkpoint` ON `haccp_controls` (`date`,`checkpoint`);
--> statement-breakpoint
CREATE INDEX `idx_haccp_controls_status` ON `haccp_controls` (`status`);
--> statement-breakpoint
CREATE TABLE `audits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`audit_type` text NOT NULL,
	`category` text NOT NULL,
	`score` real,
	`max_score` integer DEFAULT 100,
	`percentage` real,
	`status` text,
	`audited_by` text,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_audits_date_category` ON `audits` (`date`,`category`);
--> statement-breakpoint
CREATE INDEX `idx_audits_status` ON `audits` (`status`);
--> statement-breakpoint
CREATE TABLE `audit_opportunities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`audit_id` integer,
	`date` text NOT NULL,
	`description` text NOT NULL,
	`severity` text NOT NULL,
	`category` text,
	`priority` integer,
	`status` text DEFAULT 'open' NOT NULL,
	`assigned_to` text,
	`due_date` text,
	`resolution` text,
	`closed_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_audit_opportunities_date_severity` ON `audit_opportunities` (`date`,`severity`);
--> statement-breakpoint
CREATE INDEX `idx_audit_opportunities_status` ON `audit_opportunities` (`status`);
--> statement-breakpoint
CREATE TABLE `pac_actions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`description` text NOT NULL,
	`source` text,
	`source_id` integer,
	`priority` integer,
	`deadline` text,
	`assigned_to` text,
	`status` text DEFAULT 'open' NOT NULL,
	`progress` integer DEFAULT 0,
	`notes` text,
	`completed_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_pac_actions_deadline_status` ON `pac_actions` (`deadline`,`status`);
--> statement-breakpoint
CREATE INDEX `idx_pac_actions_priority` ON `pac_actions` (`priority`);
--> statement-breakpoint
CREATE TABLE `staff` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text UNIQUE,
	`phone` text,
	`role` text NOT NULL,
	`department` text,
	`status` text DEFAULT 'active' NOT NULL,
	`hire_date` text,
	`manager` text,
	`certifications` text,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_staff_role` ON `staff` (`role`);
--> statement-breakpoint
CREATE INDEX `idx_staff_status` ON `staff` (`status`);
--> statement-breakpoint
CREATE TABLE `schedules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`staff_id` integer NOT NULL,
	`date` text NOT NULL,
	`start_time` text,
	`end_time` text,
	`shift` text,
	`daypart` text,
	`area` text,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_schedules_staff_date` ON `schedules` (`staff_id`,`date`);
--> statement-breakpoint
CREATE INDEX `idx_schedules_date` ON `schedules` (`date`);
--> statement-breakpoint
CREATE TABLE `training_courses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category` text,
	`duration` integer,
	`mandatory` integer DEFAULT 0,
	`expiry_months` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_training_courses_category` ON `training_courses` (`category`);
--> statement-breakpoint
CREATE TABLE `training_progress` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`staff_id` integer NOT NULL,
	`course_id` integer NOT NULL,
	`start_date` text,
	`completion_date` text,
	`status` text DEFAULT 'in_progress' NOT NULL,
	`score` real,
	`certification_expiry` text,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_training_progress_staff_course` ON `training_progress` (`staff_id`,`course_id`);
--> statement-breakpoint
CREATE INDEX `idx_training_progress_status` ON `training_progress` (`status`);
--> statement-breakpoint
CREATE TABLE `costs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`month` text NOT NULL,
	`category` text NOT NULL,
	`description` text,
	`amount` real NOT NULL,
	`budget` real,
	`variance` real,
	`status` text,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_costs_month_category` ON `costs` (`month`,`category`);
--> statement-breakpoint
CREATE INDEX `idx_costs_date` ON `costs` (`date`);
--> statement-breakpoint
CREATE TABLE `maintenance` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`equipment_name` text NOT NULL,
	`equipment_id` text,
	`area` text,
	`type` text NOT NULL,
	`description` text NOT NULL,
	`technician` text,
	`status` text NOT NULL,
	`cost` real,
	`next_scheduled` text,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_maintenance_date_status` ON `maintenance` (`date`,`status`);
--> statement-breakpoint
CREATE INDEX `idx_maintenance_equipment` ON `maintenance` (`equipment_id`);
