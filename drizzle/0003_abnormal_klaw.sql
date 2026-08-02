ALTER TABLE `users` ADD `name` text DEFAULT '' NOT NULL;
--> statement-breakpoint
UPDATE `users` SET `name` = 'Tiago Soutelo' WHERE `login` = 'tiago.soutelo@pt.mcd.com';
