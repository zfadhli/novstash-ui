import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

export const novels = sqliteTable("novels", {
	slug: text("slug").primaryKey(),
	title: text("title").notNull(),
	author: text("author"),
	status: text("status"),
	genres: text("genres"), // JSON array stored as TEXT
	description: text("description"),
	coverUrl: text("cover_url"),
	chapterCount: integer("chapter_count"),
	createdAt: text("created_at"),
});

export const chapters = sqliteTable(
	"chapters",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		novelSlug: text("novel_slug")
			.notNull()
			.references(() => novels.slug, { onDelete: "cascade" }),
		idx: integer("idx").notNull(),
		title: text("title").notNull(),
		url: text("url"),
		contentMd: text("content_md"),
		createdAt: text("created_at"),
	},
	(table) => ({
		novelIdxUnique: unique("uq_chapters_novel_idx").on(
			table.novelSlug,
			table.idx,
		),
	}),
);
