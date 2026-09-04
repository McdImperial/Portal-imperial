CREATE TABLE `nature_walk_shopping_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product` text NOT NULL,
	`quantity` text NOT NULL,
	`created_by` integer NOT NULL,
	`created_by_name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_nature_walk_shopping_items_created` ON `nature_walk_shopping_items` (`created_at`);