CREATE TABLE `connection_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`sender` text NOT NULL,
	`recipient` text NOT NULL,
	`sender_rev` integer NOT NULL,
	`recipient_rev` integer NOT NULL,
	`payload` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`room` text,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `connection_sender` ON `connection_requests` (`sender`);--> statement-breakpoint
CREATE INDEX `connection_recipient` ON `connection_requests` (`recipient`);--> statement-breakpoint
CREATE TABLE `discovery_profiles` (
	`user` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`pieces` text NOT NULL,
	`enabled` integer DEFAULT 0 NOT NULL,
	`rev` integer DEFAULT 0 NOT NULL,
	`updated` text NOT NULL
);
