import { db, schema } from "@novstash-ui/db";
import { desc } from "drizzle-orm";

export default defineEventHandler(async (event) => {
	await ensureAdmin(event);

	const items = await db
		.select({
			id: schema.users.id,
			email: schema.users.email,
			name: schema.users.name,
			avatar: schema.users.avatar,
			role: schema.users.role,
			createdAt: schema.users.createdAt,
		})
		.from(schema.users)
		.orderBy(desc(schema.users.createdAt));

	return { items };
});
