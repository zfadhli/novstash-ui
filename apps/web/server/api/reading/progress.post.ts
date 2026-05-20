import { db, schema } from "@novstash-ui/db";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const { novelSlug, chapterIdx, chapterTitle } = body;

	if (!novelSlug || chapterIdx === undefined) {
		throw createError({
			statusCode: 400,
			statusMessage: "novelSlug and chapterIdx are required",
		});
	}

	const existing = await db.query.readingHistory.findFirst({
		where: eq(schema.readingHistory.novelSlug, novelSlug),
	});

	if (existing) {
		await db
			.update(schema.readingHistory)
			.set({
				chapterIdx,
				chapterTitle: chapterTitle ?? null,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(schema.readingHistory.novelSlug, novelSlug))
			.execute();
	} else {
		await db
			.insert(schema.readingHistory)
			.values({
				novelSlug,
				chapterIdx,
				chapterTitle: chapterTitle ?? null,
				updatedAt: new Date().toISOString(),
			})
			.execute();
	}

	return { success: true };
});
