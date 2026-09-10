CREATE TABLE `join_requests` (
	`room` text NOT NULL,
	`user` text NOT NULL,
	`name` text NOT NULL,
	PRIMARY KEY(`room`, `user`)
);
