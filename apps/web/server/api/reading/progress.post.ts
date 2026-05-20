import { db, schema } from "@novstash-ui/db";
import { and, eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
	const session = await getUserSession(event);
	if (!session?.user?.id) {
		throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
	}

	const body = await readBody(event);
	const { novelSlug, chapterIdx, chapterTitle } = body;

	if (!novelSlug || chapterIdx === undefined) {
		throw createError({
			statusCode: 400,
			statusMessage: "Missing required fields",
		});
	}

	const userId = session.user.id;
	const now = new Date().toISOString();

	const existing = await db
		.select()
		.from(schema.readingHistory)
		.where(
			and(
				eq(schema.readingHistory.novelSlug, novelSlug),
				eq(schema.readingHistory.userId, userId),
			),
		)
		.limit(1);

	if (existing.length > 0) {
		await db
			.update(schema.readingHistory)
			.set({ chapterIdx, chapterTitle: chapterTitle ?? null, updatedAt: now })
			.where(
				and(
					eq(schema.readingHistory.novelSlug, novelSlug),
					eq(schema.readingHistory.userId, userId),
				),
			);
	} else {
		await db.insert(schema.readingHistory).values({
			userId,
			novelSlug,
			chapterIdx,
			chapterTitle: chapterTitle ?? null,
			updatedAt: now,
		});
	}

	return { success: true };
});
