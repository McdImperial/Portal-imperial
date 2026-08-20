CREATE TABLE `billing_documents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`delivery_date` text NOT NULL,
	`document_type` text NOT NULL,
	`file_key` text NOT NULL,
	`file_name` text NOT NULL,
	`content_type` text NOT NULL,
	`file_size` integer NOT NULL,
	`uploaded_by` integer NOT NULL,
	`uploaded_by_name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `billing_documents_file_key_unique` ON `billing_documents` (`file_key`);--> statement-breakpoint
CREATE INDEX `idx_billing_documents_delivery_type` ON `billing_documents` (`delivery_date`,`document_type`);