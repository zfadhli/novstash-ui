import { relations } from "drizzle-orm";
import { novels, chapters } from "./index";

export const novelsRelations = relations(novels, ({ many }) => ({
	chapters: many(chapters),
}));

export const chaptersRelations = relations(chapters, ({ one }) => ({
	novel: one(novels, {
		fields: [chapters.novelSlug],
		references: [novels.slug],
	}),
}));
