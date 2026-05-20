import { db, schema } from "@novstash-ui/db";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
	const { id } = getRouterParams(event);

	const novel = await db.query.novels.findFirst({
		where: eq(schema.novels.id, id),
		with: {
			chapters: {
				orderBy: (chapters, { asc }) => [asc(chapters.number)],
			},
		},
	});

	if (!novel) {
		throw createError({ statusCode: 404, statusMessage: "Novel not found" });
	}

	return novel;
});
