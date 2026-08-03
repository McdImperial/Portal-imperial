CREATE TABLE `cleaning_interventions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`area` text NOT NULL,
	`kind` text DEFAULT 'Limpeza' NOT NULL,
	`scheduled_date` text NOT NULL,
	`estimated_hours` real NOT NULL,
	`resources` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'Agendada' NOT NULL,
	`created_by` integer NOT NULL,
	`created_by_name` text NOT NULL,
	`closed_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_cleaning_interventions_scheduled_date` ON `cleaning_interventions` (`scheduled_date`);