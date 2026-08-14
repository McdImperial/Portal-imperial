CREATE TABLE `talent_candidates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`contact` text NOT NULL,
	`admission_date` text NOT NULL,
	`status` text DEFAULT 'Recebida' NOT NULL,
	`cv_key` text NOT NULL,
	`cv_name` text NOT NULL,
	`cover_letter_key` text NOT NULL,
	`cover_letter_name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_talent_candidates_status_created` ON `talent_candidates` (`status`,`created_at`);