import { db, schema } from "@novstash-ui/db";
import { and, asc, desc, eq, gt, lt } from "drizzle-orm";

export default defineEventHandler(async (event) => {
	const { id, chapterId } = getRouterParams(event);

	const chapter = await db.query.chapters.findFirst({
		where: and(
			eq(schema.chapters.id, chapterId),
			eq(schema.chapters.novelId, id),
		),
	});

	if (!chapter) {
		throw createError({
			statusCode: 404,
			statusMessage: "Chapter not found",
		});
	}

	const [prevChapter, nextChapter] = await Promise.all([
		db.query.chapters.findFirst({
			where: and(
				eq(schema.chapters.novelId, id),
				lt(schema.chapters.number, chapter.number),
			),
			orderBy: [desc(schema.chapters.number)],
			columns: { id: true, number: true, title: true },
		}),
		db.query.chapters.findFirst({
			where: and(
				eq(schema.chapters.novelId, id),
				gt(schema.chapters.number, chapter.number),
			),
			orderBy: [asc(schema.chapters.number)],
			columns: { id: true, number: true, title: true },
		}),
	]);

	return {
		...chapter,
		prevChapter: prevChapter || null,
		nextChapter: nextChapter || null,
	};
});
