CREATE TABLE `vault_controls` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`control_date` text NOT NULL,
	`shift` text NOT NULL,
	`large_bags` text DEFAULT '{}' NOT NULL,
	`small_bags` text DEFAULT '{}' NOT NULL,
	`note_counts` text DEFAULT '{}' NOT NULL,
	`loose_coins` real DEFAULT 0 NOT NULL,
	`till_funds` real DEFAULT 0 NOT NULL,
	`invoices` real DEFAULT 0 NOT NULL,
	`bank_coins_1` real DEFAULT 0 NOT NULL,
	`bank_coins_2` real DEFAULT 0 NOT NULL,
	`theoretical_total` real DEFAULT 0 NOT NULL,
	`counted_total` real DEFAULT 0 NOT NULL,
	`vault_total` real DEFAULT 0 NOT NULL,
	`difference` real DEFAULT 0 NOT NULL,
	`delivering_manager` text NOT NULL,
	`receiving_manager` text NOT NULL,
	`created_by` integer NOT NULL,
	`created_by_name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_vault_controls_date_shift` ON `vault_controls` (`control_date`,`shift`);