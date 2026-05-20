import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const novels = sqliteTable("novels", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	author: text("author"),
	coverUrl: text("cover_url"),
	synopsis: text("synopsis"),
	status: text("status"), // ongoing, completed, hiatus
	source: text("source"),
	sourceUrl: text("source_url"),
	genres: text("genres"), // comma-separated
	rating: real("rating"),
	chapterCount: integer("chapter_count"),
	createdAt: text("created_at"),
	updatedAt: text("updated_at"),
});

export const chapters = sqliteTable("chapters", {
	id: text("id").primaryKey(),
	novelId: text("novel_id")
		.notNull()
		.references(() => novels.id, { onDelete: "cascade" }),
	number: integer("number").notNull(),
	title: text("title"),
	content: text("content").notNull(),
	createdAt: text("created_at"),
	updatedAt: text("updated_at"),
});
