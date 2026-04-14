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
	`updated_at` timestamp,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_pizza_id_pizzas_id_fk` FOREIGN KEY (`pizza_id`) REFERENCES `pizzas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;