import { db, schema } from "@novstash-ui/db";
import { and, eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
	await ensureAdmin(event);

	const { slug, idx } = getRouterParams(event);
	const body = await readBody(event);

	const updated = await db
		.update(schema.chapters)
		.set({
			title: body.title,
			url: body.url ?? null,
			contentMd: body.contentMd ?? null,
		})
		.where(
			and(
				eq(schema.chapters.novelSlug, slug),
				eq(schema.chapters.idx, Number(idx)),
			),
		)
		.returning();

	if (updated.length === 0) {
		throw createError({ statusCode: 404, statusMessage: "Not Found" });
	}

	return updated[0];
});
