CREATE TABLE `vault_invoices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`invoice_date` text NOT NULL,
	`entity` text NOT NULL,
	`items` text DEFAULT '[]' NOT NULL,
	`total_amount` real DEFAULT 0 NOT NULL,
	`rubric` text NOT NULL,
	`tag` text NOT NULL,
	`beneficiary` text NOT NULL,
	`verified` integer DEFAULT false NOT NULL,
	`petty_cash` integer DEFAULT false NOT NULL,
	`image_name` text DEFAULT '' NOT NULL,
	`created_by` integer NOT NULL,
	`created_by_name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_vault_invoices_date` ON `vault_invoices` (`invoice_date`);