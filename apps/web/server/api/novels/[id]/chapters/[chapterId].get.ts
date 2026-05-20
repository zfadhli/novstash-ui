import { db, schema } from "@novstash-ui/db";
import { and, asc, desc, eq, gt, lt } from "drizzle-orm";

export default defineEventHandler(async (event) => {
	const { id, chapterId } = getRouterParams(event);
	const idx = Number(chapterId);

	if (Number.isNaN(idx)) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid chapter index",
		});
	}

	const chapter = await db.query.chapters.findFirst({
		where: and(eq(schema.chapters.idx, idx), eq(schema.chapters.novelSlug, id)),
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
				eq(schema.chapters.novelSlug, id),
				lt(schema.chapters.idx, idx),
			),
			orderBy: [desc(schema.chapters.idx)],
			columns: { id: true, idx: true, title: true },
		}),
		db.query.chapters.findFirst({
			where: and(
				eq(schema.chapters.novelSlug, id),
				gt(schema.chapters.idx, idx),
			),
			orderBy: [asc(schema.chapters.idx)],
			columns: { id: true, idx: true, title: true },
		}),
	]);

	return {
		...chapter,
		prevChapter: prevChapter || null,
		nextChapter: nextChapter || null,
	};
});
