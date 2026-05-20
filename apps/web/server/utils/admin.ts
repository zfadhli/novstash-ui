import { db, schema } from "@novstash-ui/db";
import { eq } from "drizzle-orm";

export async function ensureAdmin(event: H3Event): Promise<void> {
	const session = await getUserSession(event);
	if (!session?.user?.id) {
		throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
	}
	const user = await db
		.select({ role: schema.users.role })
		.from(schema.users)
		.where(eq(schema.users.id, session.user.id))
		.limit(1);
	if (user.length === 0 || user[0].role !== "admin") {
		throw createError({ statusCode: 403, statusMessage: "Forbidden" });
	}
}
