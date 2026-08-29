CREATE TABLE `coin_order_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`minimum_large_bags` text DEFAULT '{"0.05":1,"0.1":1,"0.2":1,"0.5":1,"1":1}' NOT NULL,
	`updated_by` integer NOT NULL,
	`updated_by_name` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
