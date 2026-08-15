PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_talent_candidates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`contact` text NOT NULL,
	`admission_date` text NOT NULL,
	`job_title` text DEFAULT '' NOT NULL,
	`profile` text DEFAULT 'Classificar' NOT NULL,
	`status` text DEFAULT 'Recebida' NOT NULL,
	`cv_key` text NOT NULL,
	`cv_name` text NOT NULL,
	`cover_letter_key` text NOT NULL,
	`cover_letter_name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_talent_candidates`("id", "name", "email", "contact", "admission_date", "job_title", "profile", "status", "cv_key", "cv_name", "cover_letter_key", "cover_letter_name", "created_at", "updated_at") SELECT "id", "name", "email", "contact", "admission_date", "job_title", "profile", "status", "cv_key", "cv_name", "cover_letter_key", "cover_letter_name", "created_at", "updated_at" FROM `talent_candidates`;--> statement-breakpoint
DROP TABLE `talent_candidates`;--> statement-breakpoint
ALTER TABLE `__new_talent_candidates` RENAME TO `talent_candidates`;--> statement-breakpoint
UPDATE `talent_candidates` SET `profile` = 'Classificar' WHERE `profile` = 'Sem perfil';--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_talent_candidates_status_created` ON `talent_candidates` (`status`,`created_at`);
