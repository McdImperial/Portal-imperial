CREATE TABLE `management_performance_evaluations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`manager_name` text NOT NULL,
	`period` text NOT NULL,
	`scores` text DEFAULT '{}' NOT NULL,
	`quantitative_score` real DEFAULT 0 NOT NULL,
	`qualitative_rating` text NOT NULL,
	`strengths` text DEFAULT '' NOT NULL,
	`improvements` text DEFAULT '' NOT NULL,
	`created_by` integer NOT NULL,
	`created_by_name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_management_performance_manager_period` ON `management_performance_evaluations` (`manager_name`,`period`);