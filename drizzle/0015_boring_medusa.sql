CREATE TABLE `alert_conditions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`alert_id` integer NOT NULL,
	`source` text DEFAULT 'manual' NOT NULL,
	`field` text DEFAULT '' NOT NULL,
	`operator` text DEFAULT 'equals' NOT NULL,
	`expected_value` text DEFAULT '' NOT NULL,
	`payload_path` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`alert_id`) REFERENCES `alerts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `alert_conditions_alert_id_unique` ON `alert_conditions` (`alert_id`);--> statement-breakpoint
CREATE TABLE `recipients` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`department` text DEFAULT '' NOT NULL,
	`role` text DEFAULT '' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `recipients_phone_unique` ON `recipients` (`phone`);--> statement-breakpoint
CREATE INDEX `idx_recipients_active_name` ON `recipients` (`active`,`name`);--> statement-breakpoint
CREATE TABLE `alert_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`alert_id` integer,
	`alert_name` text NOT NULL,
	`recipient_id` integer,
	`recipient_name` text NOT NULL,
	`recipient_phone_masked` text NOT NULL,
	`scheduled_at` text NOT NULL,
	`sent_at` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`provider` text DEFAULT 'simulation' NOT NULL,
	`provider_message_id` text,
	`idempotency_key` text NOT NULL,
	`attempt` integer DEFAULT 1 NOT NULL,
	`error_code` text,
	`error_message` text,
	`rendered_message` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`alert_id`) REFERENCES `alerts`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`recipient_id`) REFERENCES `recipients`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `alert_logs_idempotency_key_unique` ON `alert_logs` (`idempotency_key`);--> statement-breakpoint
CREATE INDEX `idx_alert_logs_alert_created` ON `alert_logs` (`alert_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_alert_logs_status_created` ON `alert_logs` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `alert_recipients` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`alert_id` integer NOT NULL,
	`recipient_id` integer,
	`group_id` integer,
	FOREIGN KEY (`alert_id`) REFERENCES `alerts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`recipient_id`) REFERENCES `recipients`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`group_id`) REFERENCES `recipient_groups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_alert_recipients_alert` ON `alert_recipients` (`alert_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uidx_alert_recipients_alert_recipient` ON `alert_recipients` (`alert_id`,`recipient_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uidx_alert_recipients_alert_group` ON `alert_recipients` (`alert_id`,`group_id`);--> statement-breakpoint
CREATE TABLE `alert_schedules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`alert_id` integer NOT NULL,
	`frequency` text DEFAULT 'once' NOT NULL,
	`scheduled_at` text,
	`time_of_day` text,
	`week_days` text DEFAULT '[]' NOT NULL,
	`month_day` integer,
	`anticipation_minutes` integer DEFAULT 0 NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`alert_id`) REFERENCES `alerts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `alert_schedules_alert_id_unique` ON `alert_schedules` (`alert_id`);--> statement-breakpoint
CREATE TABLE `alert_templates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`category` text DEFAULT 'Operacional' NOT NULL,
	`message` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `alert_templates_name_unique` ON `alert_templates` (`name`);--> statement-breakpoint
CREATE TABLE `alerts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`type` text DEFAULT 'scheduled' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`channel` text DEFAULT 'whatsapp' NOT NULL,
	`template_id` integer,
	`message` text NOT NULL,
	`timezone` text DEFAULT 'Europe/Lisbon' NOT NULL,
	`last_run_at` text,
	`next_run_at` text,
	`created_by` integer NOT NULL,
	`created_by_name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`template_id`) REFERENCES `alert_templates`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_alerts_status_next_run` ON `alerts` (`status`,`next_run_at`);--> statement-breakpoint
CREATE TABLE `recipient_group_members` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`group_id` integer NOT NULL,
	`recipient_id` integer NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `recipient_groups`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`recipient_id`) REFERENCES `recipients`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uidx_recipient_group_members_group_recipient` ON `recipient_group_members` (`group_id`,`recipient_id`);--> statement-breakpoint
CREATE INDEX `idx_recipient_group_members_recipient` ON `recipient_group_members` (`recipient_id`);--> statement-breakpoint
CREATE TABLE `recipient_groups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `recipient_groups_name_unique` ON `recipient_groups` (`name`);