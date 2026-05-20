import { db, schema } from "@novstash-ui/db";
import { and, desc, eq, like, sql } from "drizzle-orm";

export default defineEventHandler(async (event) => {
	const query = getQuery(event);

	const q = (query.q as string) || "";
	const genreParam = (query.genre as string) || "";
	const status = (query.status as string) || "";
	const sort = (query.sort as string) || "newest";
	const page = Math.max(1, Number(query.page) || 1);
	const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
	const offset = (page - 1) * limit;

	const genres = genreParam
		? genreParam
				.split(",")
				.map((g) => g.trim())
				.filter(Boolean)
		: [];

	// Build conditions
	const conditions: ReturnType<typeof like>[] = [];

	if (q) {
		conditions.push(like(schema.novels.title, `%${q}%`));
	}

	if (status) {
		conditions.push(eq(schema.novels.status, status));
	}

	// Genre filtering: use LIKE for each genre string inside the JSON array
	for (const genre of genres) {
		// Match JSON string values: e.g., '"Fantasy"' appears in the JSON text
		conditions.push(like(schema.novels.genres, `%"${genre}"%`));
	}

	const where = conditions.length > 0 ? and(...conditions) : undefined;

	// Build order
	let orderBy: ReturnType<typeof desc>;
	switch (sort) {
		case "title":
			orderBy = desc(sql`${schema.novels.title} COLLATE NOCASE`);
			break;
		case "chapters":
			orderBy = desc(schema.novels.chapterCount);
			break;
		case "updated":
			orderBy = desc(schema.novels.createdAt);
			break;
		default:
			orderBy = desc(schema.novels.createdAt);
			break;
	}

	const [items, totalResult] = await Promise.all([
		db
			.select()
			.from(schema.novels)
			.where(where)
			.orderBy(orderBy)
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
