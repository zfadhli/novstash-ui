import { db, schema } from "@novstash-ui/db";
import { desc, like, sql } from "drizzle-orm";

export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const search = (query.q as string) || "";
	const page = Math.max(1, Number(query.page) || 1);
	const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
	const offset = (page - 1) * limit;

	const where = search ? like(schema.novels.title, `%${search}%`) : undefined;

	const [items, totalResult] = await Promise.all([
		db
			.select()
			.from(schema.novels)
			.where(where)
			.orderBy(desc(schema.novels.updatedAt))
			.limit(limit)
			.offset(offset),
		db
			.select({ count: sql<number>`count(*)` })
			.from(schema.novels)
			.where(where),
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
