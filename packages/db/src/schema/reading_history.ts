import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { novels } from "./index";

export const readingHistory = sqliteTable(
	"reading_history",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		novelSlug: text("novel_slug")
			.notNull()
			.references(() => novels.slug, { onDelete: "cascade" }),
		chapterIdx: integer("chapter_idx").notNull(),
		chapterTitle: text("chapter_title"),
		updatedAt: text("updated_at"),
	},
	(table) => ({
		novelUnique: unique("uq_reading_history_novel").on(table.novelSlug),
	}),
);
