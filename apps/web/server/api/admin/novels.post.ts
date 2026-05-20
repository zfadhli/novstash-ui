import { db, schema } from "@novstash-ui/db";

export default defineEventHandler(async (event) => {
	await ensureAdmin(event);

	const body = await readBody(event);

	const novel = await db
		.insert(schema.novels)
		.values({
			slug: body.slug,
			title: body.title,
			author: body.author ?? null,
			status: body.status ?? null,
			genres: body.genres ?? null,
			description: body.description ?? null,
			coverUrl: body.coverUrl ?? null,
			chapterCount: body.chapterCount ?? null,
			createdAt: new Date().toISOString(),
		})
		.returning();

	return novel[0];
});
