import { db, schema } from "@novstash-ui/db";
import { and, eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
	await ensureAdmin(event);

	const { slug, idx } = getRouterParams(event);

	const deleted = await db
		.delete(schema.chapters)
		.where(
			and(
				eq(schema.chapters.novelSlug, slug),
				eq(schema.chapters.idx, Number(idx)),
			),
		)
		.returning();

	if (deleted.length === 0) {
		throw createError({ statusCode: 404, statusMessage: "Not Found" });
	}

	return { success: true };
});
