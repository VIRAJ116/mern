CREATE TABLE `pizzas` (
	`id` char(36) NOT NULL,
	`name` varchar(256) NOT NULL,
	`description` varchar(1000) NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`category` varchar(50) NOT NULL,
	`tags` varchar(256) NOT NULL,
	`image_url` varchar(500) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pizzas_id` PRIMARY KEY(`id`)
);
