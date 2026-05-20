import { db, schema } from "@novstash-ui/db";
import { desc } from "drizzle-orm";

export default defineEventHandler(async (event) => {
	await ensureAdmin(event);

	const items = await db
		.select()
		.from(schema.novels)
		.orderBy(desc(schema.novels.createdAt));

	return { items };
});
