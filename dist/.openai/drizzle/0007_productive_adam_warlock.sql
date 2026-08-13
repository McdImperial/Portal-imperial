CREATE TABLE `area_evaluations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`month` text NOT NULL,
	`department` text NOT NULL,
	`area` text NOT NULL,
	`cleaning_rating` text DEFAULT '' NOT NULL,
	`maintenance_rating` text DEFAULT '' NOT NULL,
	`evaluated_by` integer NOT NULL,
	`evaluated_by_name` text NOT NULL,
	`evaluated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uidx_area_evaluations_month_department_area` ON `area_evaluations` (`month`,`department`,`area`);