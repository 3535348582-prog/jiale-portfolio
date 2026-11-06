CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`author_id` text NOT NULL,
	`body` text NOT NULL,
	`parent_id` text,
	`created_at` integer NOT NULL,
	`deleted` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `comments_created_idx` ON `comments` (`created_at`,`id`);--> statement-breakpoint
CREATE INDEX `comments_author_created_idx` ON `comments` (`author_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `comments_parent_idx` ON `comments` (`parent_id`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`token_hash` text NOT NULL,
	`nickname` text NOT NULL,
	`star` text NOT NULL,
	`created_at` integer NOT NULL,
	`last_post_at` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profiles_token_hash_unique` ON `profiles` (`token_hash`);--> statement-breakpoint
CREATE TABLE `reactions` (
	`comment_id` text NOT NULL,
	`visitor_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	PRIMARY KEY(`comment_id`, `visitor_id`),
	FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`visitor_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `session_limits` (
	`ip_hash` text NOT NULL,
	`hour` integer NOT NULL,
	`count` integer NOT NULL,
	PRIMARY KEY(`ip_hash`, `hour`)
);
