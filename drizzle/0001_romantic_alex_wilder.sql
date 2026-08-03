ALTER TABLE `health_records` ADD `source_key` text;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_health_records_source_key` ON `health_records` (`source_key`);