CREATE TABLE `favorites` (
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`item_id` text NOT NULL,
	`saved_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `kind`, `item_id`),
	CONSTRAINT "favorites_kind" CHECK("favorites"."kind" IN ('peptide', 'study'))
);
--> statement-breakpoint
CREATE INDEX `idx_favorites_user_saved` ON `favorites` (`user_id`,`saved_at`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`bio` text DEFAULT '' NOT NULL,
	`updated_at` integer NOT NULL
);
