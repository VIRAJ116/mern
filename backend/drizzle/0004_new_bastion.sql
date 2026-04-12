CREATE TABLE `ratings` (
	`id` char(36) NOT NULL,
	`user_id` char(36) NOT NULL,
	`pizza_id` char(36) NOT NULL,
	`rating` decimal(2,1) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp,
	CONSTRAINT `ratings_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_pizza_unique` UNIQUE(`user_id`,`pizza_id`)
);
--> statement-breakpoint
ALTER TABLE `pizzas` ADD `avg_rating` decimal(3,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `pizzas` ADD `rating_count` decimal DEFAULT '0';--> statement-breakpoint
ALTER TABLE `ratings` ADD CONSTRAINT `ratings_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ratings` ADD CONSTRAINT `ratings_pizza_id_pizzas_id_fk` FOREIGN KEY (`pizza_id`) REFERENCES `pizzas`(`id`) ON DELETE cascade ON UPDATE no action;