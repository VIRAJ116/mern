CREATE TABLE `categories` (
	`id` char(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp,
	`deleted_at` timestamp,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `toppings` (
	`id` char(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`icon` varchar(10) NOT NULL DEFAULT '🍕',
	`is_available` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp,
	`deleted_at` timestamp,
	CONSTRAINT `toppings_id` PRIMARY KEY(`id`)
);
