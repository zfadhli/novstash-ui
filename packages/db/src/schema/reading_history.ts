import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { novels, users } from "./index";

export const readingHistory = sqliteTable(
	"reading_history",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
		novelSlug: text("novel_slug")
			.notNull()
			.references(() => novels.slug, { onDelete: "cascade" }),
		chapterIdx: integer("chapter_idx").notNull(),
		chapterTitle: text("chapter_title"),
		updatedAt: text("updated_at"),
	},
	(table) => ({
		novelUserUnique: unique("uq_reading_history_novel_user").on(
			table.novelSlug,
			table.userId,
		),
	}),
);
