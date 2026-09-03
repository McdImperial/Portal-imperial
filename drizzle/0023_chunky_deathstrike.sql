CREATE TABLE `nature_walk_registrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`interested` integer DEFAULT true NOT NULL,
	`sharing_item` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'Pendente' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_nature_walk_registrations_status_created` ON `nature_walk_registrations` (`status`,`created_at`);