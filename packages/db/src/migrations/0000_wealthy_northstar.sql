CREATE TABLE `reading_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`novel_slug` text NOT NULL,
	`chapter_idx` integer NOT NULL,
	`chapter_title` text,
	`updated_at` text,
	FOREIGN KEY (`novel_slug`) REFERENCES `novels`(`slug`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_reading_history_novel` ON `reading_history` (`novel_slug`);--> statement-breakpoint
CREATE TABLE `chapters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`novel_slug` text NOT NULL,
	`idx` integer NOT NULL,
	`title` text NOT NULL,
	`url` text,
	`content_md` text,
	`created_at` text,
	FOREIGN KEY (`novel_slug`) REFERENCES `novels`(`slug`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_chapters_novel_idx` ON `chapters` (`novel_slug`,`idx`);--> statement-breakpoint
CREATE TABLE `novels` (
	`slug` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`author` text,
	`status` text,
	`genres` text,
	`description` text,
	`cover_url` text,
	`chapter_count` integer,
	`created_at` text
);
