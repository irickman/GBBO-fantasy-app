PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_season_totals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`player_id` integer NOT NULL,
	`total_points` real DEFAULT 0 NOT NULL,
	`last_updated` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_season_totals`("id", "player_id", "total_points", "last_updated") SELECT "id", "player_id", "total_points", "last_updated" FROM `season_totals`;--> statement-breakpoint
DROP TABLE `season_totals`;--> statement-breakpoint
ALTER TABLE `__new_season_totals` RENAME TO `season_totals`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `season_totals_player_id_unique` ON `season_totals` (`player_id`);--> statement-breakpoint
CREATE TABLE `__new_teams` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`player_id` integer NOT NULL,
	`contestant_id` integer NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`contestant_id`) REFERENCES `contestants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_teams`("id", "player_id", "contestant_id", "is_active", "created_at", "updated_at") SELECT "id", "player_id", "contestant_id", "is_active", "created_at", "updated_at" FROM `teams`;--> statement-breakpoint
DROP TABLE `teams`;--> statement-breakpoint
ALTER TABLE `__new_teams` RENAME TO `teams`;--> statement-breakpoint
CREATE INDEX `teams_player_active_idx` ON `teams` (`player_id`,`is_active`);--> statement-breakpoint
CREATE INDEX `teams_contestant_idx` ON `teams` (`contestant_id`);--> statement-breakpoint
CREATE TABLE `__new_weekly_scores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`week` integer NOT NULL,
	`contestant_id` integer NOT NULL,
	`category` text NOT NULL,
	`points` real NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`contestant_id`) REFERENCES `contestants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_weekly_scores`("id", "week", "contestant_id", "category", "points", "created_at") SELECT "id", "week", "contestant_id", "category", "points", "created_at" FROM `weekly_scores`;--> statement-breakpoint
DROP TABLE `weekly_scores`;--> statement-breakpoint
ALTER TABLE `__new_weekly_scores` RENAME TO `weekly_scores`;--> statement-breakpoint
CREATE INDEX `weekly_scores_week_contestant_idx` ON `weekly_scores` (`week`,`contestant_id`);--> statement-breakpoint
CREATE INDEX `weekly_scores_week_idx` ON `weekly_scores` (`week`);--> statement-breakpoint
CREATE TABLE `__new_contestants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`eliminated_week` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_contestants`("id", "name", "eliminated_week", "created_at") SELECT "id", "name", "eliminated_week", "created_at" FROM `contestants`;--> statement-breakpoint
DROP TABLE `contestants`;--> statement-breakpoint
ALTER TABLE `__new_contestants` RENAME TO `contestants`;--> statement-breakpoint
CREATE UNIQUE INDEX `contestants_name_unique` ON `contestants` (`name`);--> statement-breakpoint
CREATE TABLE `__new_players` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`team_name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_players`("id", "name", "team_name", "created_at") SELECT "id", "name", "team_name", "created_at" FROM `players`;--> statement-breakpoint
DROP TABLE `players`;--> statement-breakpoint
ALTER TABLE `__new_players` RENAME TO `players`;