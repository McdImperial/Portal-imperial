CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`department` text NOT NULL,
	`area` text DEFAULT 'Área geral' NOT NULL,
	`due` text DEFAULT 'Sem data' NOT NULL,
	`assignee` text DEFAULT 'TS' NOT NULL,
	`assignee_name` text,
	`priority` text DEFAULT 'Média' NOT NULL,
	`status` text DEFAULT 'Por fazer' NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
