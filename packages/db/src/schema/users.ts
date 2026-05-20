import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
	id: text("id").primaryKey(), // Google's 'sub' claim
	email: text("email").notNull().unique(),
	name: text("name"),
	avatar: text("avatar"),
	createdAt: text("created_at"),
});
