CREATE TABLE `coin_orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_date` text NOT NULL,
	`quantities` text DEFAULT '{}' NOT NULL,
	`total_amount` real DEFAULT 0 NOT NULL,
	`deposit_at` text,
	`responsible_manager` text DEFAULT '' NOT NULL,
	`created_by` integer NOT NULL,
	`created_by_name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_coin_orders_date` ON `coin_orders` (`order_date`);--> statement-breakpoint
CREATE INDEX `idx_coin_orders_deposit_at` ON `coin_orders` (`deposit_at`);