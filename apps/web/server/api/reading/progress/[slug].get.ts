import { db, schema } from "@novstash-ui/db";
import { and, eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
	const session = await getUserSession(event);
	if (!session?.user?.id) {
		throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
	}

	const { slug } = getRouterParams(event);

	const progress = await db
		.select()
		.from(schema.readingHistory)
		.where(
			and(
				eq(schema.readingHistory.novelSlug, slug),
				eq(schema.readingHistory.userId, session.user.id),
			),
		)
		.limit(1);

	return progress.length > 0 ? progress[0] : null;
});
