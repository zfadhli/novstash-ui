import { db, schema } from "@novstash-ui/db";
import { desc, eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
	const session = await getUserSession(event);
	if (!session?.user?.id) {
		throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
	}

	const recent = await db.query.readingHistory.findMany({
		where: eq(schema.readingHistory.userId, session.user.id),
		orderBy: [desc(schema.readingHistory.updatedAt)],
		limit: 10,
		with: {
			novel: {
				columns: {
					slug: true,
					title: true,
					author: true,
					coverUrl: true,
					status: true,
					chapterCount: true,
					genres: true,
					description: true,
					createdAt: true,
				},
			},
		},
	});

	return recent;
});
