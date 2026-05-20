import { db, schema } from "@novstash-ui/db";
import { asc, eq, sql } from "drizzle-orm";

export default defineEventHandler(async (event) => {
	const { id } = getRouterParams(event);
	const query = getQuery(event);
	const page = Math.max(1, Number(query.page) || 1);
	const limit = Math.min(100, Math.max(1, Number(query.limit) || 50));
	const offset = (page - 1) * limit;

	const [items, totalResult] = await Promise.all([
		db
			.select({
				id: schema.chapters.id,
				novelId: schema.chapters.novelId,
				number: schema.chapters.number,
				title: schema.chapters.title,
				createdAt: schema.chapters.createdAt,
			})
			.from(schema.chapters)
			.where(eq(schema.chapters.novelId, id))
			.orderBy(asc(schema.chapters.number))
			.limit(limit)
			.offset(offset),
		db
			.select({ count: sql<number>`count(*)` })
			.from(schema.chapters)
			.where(eq(schema.chapters.novelId, id)),
	]);

	const total = Number(totalResult[0]?.count) || 0;

	return {
		items,
		total,
		page,
		limit,
		totalPages: Math.ceil(total / limit),
	};
});
