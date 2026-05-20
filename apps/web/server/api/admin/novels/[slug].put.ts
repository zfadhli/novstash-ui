import { db, schema } from "@novstash-ui/db";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
	await ensureAdmin(event);

	const { slug } = getRouterParams(event);
	const body = await readBody(event);

	const updated = await db
		.update(schema.novels)
		.set({
			title: body.title,
			author: body.author ?? null,
			status: body.status ?? null,
			genres: body.genres ?? null,
			description: body.description ?? null,
			coverUrl: body.coverUrl ?? null,
			chapterCount: body.chapterCount ?? null,
		})
		.where(eq(schema.novels.slug, slug))
		.returning();

	if (updated.length === 0) {
		throw createError({ statusCode: 404, statusMessage: "Not Found" });
	}

	return updated[0];
});
