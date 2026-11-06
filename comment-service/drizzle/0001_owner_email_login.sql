CREATE TABLE `owner_bindings` (
	`profile_id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`verified_at` integer NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `owner_login_codes` (
	`id` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`code_hash` text NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`ready` integer DEFAULT false NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`consumed_at` integer,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `owner_codes_profile_expiry_idx` ON `owner_login_codes` (`profile_id`,`expires_at`);--> statement-breakpoint
CREATE TABLE `owner_login_grants` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `owner_grants_profile_expiry_idx` ON `owner_login_grants` (`profile_id`,`expires_at`);--> statement-breakpoint
CREATE TABLE `owner_login_limits` (
	`scope` text NOT NULL,
	`window_start` integer NOT NULL,
	`count` integer NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`scope`, `window_start`)
);
