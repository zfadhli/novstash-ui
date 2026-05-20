import { db, schema } from "@novstash-ui/db";
import { asc, eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
	const { id } = getRouterParams(event);

	const novel = await db.query.novels.findFirst({
		where: eq(schema.novels.slug, id),
		with: {
			chapters: {
				orderBy: [asc(schema.chapters.idx)],
			},
		},
	});

	if (!novel) {
		throw createError({ statusCode: 404, statusMessage: "Novel not found" });
	}

	return novel;
});
