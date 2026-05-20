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
CREATE TABLE `order_items` (
	`id` char(36) NOT NULL,
	`order_id` char(36) NOT NULL,
	`pizza_id` char(36) NOT NULL,
	`size` varchar(50) NOT NULL,
	`crust` varchar(50) NOT NULL,
	`quantity` decimal NOT NULL DEFAULT '1',
	`unit_price` decimal(10,2) NOT NULL,
	`toppings` varchar(1000),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp,
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` char(36) NOT NULL,
	`user_id` char(36) NOT NULL,
	`subtotal` decimal(10,2) NOT NULL,
	`delivery_fee` decimal(10,2) NOT NULL,
	`total_amount` decimal(10,2) NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`payment_method` varchar(50) NOT NULL DEFAULT 'cod',
	`payment_status` varchar(50) NOT NULL DEFAULT 'pending',
	`razorpay_order_id` varchar(100),
	`delivery_address` varchar(1500) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pizzas` (
	`id` char(36) NOT NULL,
	`name` varchar(256) NOT NULL,
	`description` varchar(1000) NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`category` varchar(50) NOT NULL,
	`tags` varchar(256) NOT NULL,
	`image_url` varchar(500) NOT NULL,
	`avg_rating` decimal(3,2) DEFAULT '0',
	`rating_count` decimal DEFAULT '0',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp,
	`deleted_at` timestamp,
	CONSTRAINT `pizzas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
CREATE TABLE `role_permissions` (
	`role_id` char(36) NOT NULL,
	`permission` varchar(100) NOT NULL,
	CONSTRAINT `role_permissions_role_id_permission_pk` PRIMARY KEY(`role_id`,`permission`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` char(36) NOT NULL,
	`name` varchar(50) NOT NULL,
	`description` varchar(256),
	`is_system` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp,
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `roles_name_unique` UNIQUE(`name`)
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
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`user_id` char(36) NOT NULL,
	`role_id` char(36) NOT NULL,
	CONSTRAINT `user_roles_user_id_role_id_pk` PRIMARY KEY(`user_id`,`role_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` char(36) NOT NULL,
	`name` varchar(256) NOT NULL,
	`email` varchar(256) NOT NULL,
	`password` varchar(256) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_pizza_id_pizzas_id_fk` FOREIGN KEY (`pizza_id`) REFERENCES `pizzas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ratings` ADD CONSTRAINT `ratings_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ratings` ADD CONSTRAINT `ratings_pizza_id_pizzas_id_fk` FOREIGN KEY (`pizza_id`) REFERENCES `pizzas`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE cascade ON UPDATE no action;