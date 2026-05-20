import { db, schema } from "@novstash-ui/db";
import { asc, eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
	await ensureAdmin(event);

	const { slug } = getRouterParams(event);

	const items = await db
		.select({
			id: schema.chapters.id,
			novelSlug: schema.chapters.novelSlug,
			idx: schema.chapters.idx,
			title: schema.chapters.title,
			url: schema.chapters.url,
			createdAt: schema.chapters.createdAt,
		})
		.from(schema.chapters)
		.where(eq(schema.chapters.novelSlug, slug))
		.orderBy(asc(schema.chapters.idx));

	return { items };
});
