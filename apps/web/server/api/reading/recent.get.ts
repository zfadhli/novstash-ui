import { db, schema } from "@novstash-ui/db";
import { desc } from "drizzle-orm";

export default defineEventHandler(async () => {
	const recent = await db.query.readingHistory.findMany({
		orderBy: [desc(schema.readingHistory.updatedAt)],
		limit: 10,
		with: {
			novel: {
				columns: {
					slug: true,
					title: true,
					author: true,
					coverUrl: true,
				},
			},
		},
	});

	return recent;
});
