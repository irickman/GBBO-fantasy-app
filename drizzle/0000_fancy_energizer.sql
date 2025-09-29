CREATE TABLE `contestants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`eliminated_week` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `contestants_name_unique` ON `contestants` (`name`);--> statement-breakpoint
CREATE TABLE `players` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`team_name` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `season_totals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`player_id` integer NOT NULL,
	`total_points` real DEFAULT 0 NOT NULL,
	`last_updated` integer NOT NULL,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`player_id` integer NOT NULL,
	`contestant_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`contestant_id`) REFERENCES `contestants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `weekly_scores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`week` integer NOT NULL,
	`contestant_id` integer NOT NULL,
	`category` text NOT NULL,
	`points` real NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`contestant_id`) REFERENCES `contestants`(`id`) ON UPDATE no action ON DELETE no action
);
