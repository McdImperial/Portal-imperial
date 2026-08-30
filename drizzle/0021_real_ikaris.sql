CREATE TABLE `billing_analyses` (
	`delivery_date` text PRIMARY KEY NOT NULL,
	`result_json` text NOT NULL,
	`calculated_by_name` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
