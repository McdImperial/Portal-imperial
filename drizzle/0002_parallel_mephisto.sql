CREATE TABLE `health_metrics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`profile` text NOT NULL,
	`group_name` text NOT NULL,
	`metric_key` text NOT NULL,
	`metric_label` text NOT NULL,
	`recorded_at` text NOT NULL,
	`value` real NOT NULL,
	`unit` text,
	`source_key` text NOT NULL,
	`source_url` text,
	`note` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_health_metrics_source_key` ON `health_metrics` (`source_key`);--> statement-breakpoint
CREATE INDEX `idx_health_metrics_profile_group_metric_date` ON `health_metrics` (`profile`,`group_name`,`metric_key`,`recorded_at`);