CREATE TABLE `health_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`profile` text NOT NULL,
	`kind` text NOT NULL,
	`recorded_at` text NOT NULL,
	`value_1` real,
	`value_2` real,
	`unit` text,
	`title` text,
	`notes` text,
	`duration` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_health_records_profile_date` ON `health_records` (`profile`,`recorded_at`);