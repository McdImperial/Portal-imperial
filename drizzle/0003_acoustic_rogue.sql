CREATE TABLE `finance_expenses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`month` text NOT NULL,
	`name` text NOT NULL,
	`amount` real NOT NULL,
	`payment_type` text NOT NULL,
	`entity` text,
	`reference` text,
	`due_date` text,
	`status` text DEFAULT 'Pendente' NOT NULL,
	`bank` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_finance_expenses_month_due` ON `finance_expenses` (`month`,`due_date`);