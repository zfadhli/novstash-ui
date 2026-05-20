import { relations } from "drizzle-orm";
import { chapters, novels, users } from "./index";
import { readingHistory } from "./reading_history";

export const novelsRelations = relations(novels, ({ many, one }) => ({
	chapters: many(chapters),
	readingHistory: one(readingHistory, {
		fields: [novels.slug],
		references: [readingHistory.novelSlug],
	}),
}));

export const chaptersRelations = relations(chapters, ({ one }) => ({
	novel: one(novels, {
		fields: [chapters.novelSlug],
		references: [novels.slug],
	}),
}));

export const readingHistoryRelations = relations(readingHistory, ({ one }) => ({
	novel: one(novels, {
		fields: [readingHistory.novelSlug],
		references: [novels.slug],
	}),
	user: one(users, {
		fields: [readingHistory.userId],
		references: [users.id],
	}),
}));
