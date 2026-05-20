import { db, schema } from "@novstash-ui/db";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
	const { slug } = getRouterParams(event);

	const progress = await db.query.readingHistory.findFirst({
		where: eq(schema.readingHistory.novelSlug, slug),
	});

	if (!progress) {
		throw createError({
			statusCode: 404,
			statusMessage: "No reading progress found",
		});
	}

	return progress;
});
