CREATE TABLE `petty_cash_closures` (
	`month` text PRIMARY KEY NOT NULL,
	`completed_date` text NOT NULL,
	`manager` text NOT NULL,
	`completed_by` integer NOT NULL,
	`completed_by_name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
