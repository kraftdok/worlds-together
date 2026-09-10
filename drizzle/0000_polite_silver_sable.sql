CREATE TABLE `budgets` (
	`user` text PRIMARY KEY NOT NULL,
	`window` integer NOT NULL,
	`count` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`mime` text NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `members` (
	`room` text NOT NULL,
	`user` text NOT NULL,
	`name` text NOT NULL,
	PRIMARY KEY(`room`, `user`)
);
--> statement-breakpoint
CREATE TABLE `pieces` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`kind` text NOT NULL,
	`media` text,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `pieces_owner` ON `pieces` (`owner`);--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`kind` text NOT NULL,
	`invite_hash` text NOT NULL,
	`state` text NOT NULL,
	`rev` integer DEFAULT 0 NOT NULL,
	`created` text NOT NULL
);
