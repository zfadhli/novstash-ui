import { db, schema } from "@novstash-ui/db";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
	await ensureAdmin(event);

	const { slug } = getRouterParams(event);

	const deleted = await db
		.delete(schema.novels)
		.where(eq(schema.novels.slug, slug))
		.returning();

	if (deleted.length === 0) {
		throw createError({ statusCode: 404, statusMessage: "Not Found" });
	}

	return { success: true };
});
