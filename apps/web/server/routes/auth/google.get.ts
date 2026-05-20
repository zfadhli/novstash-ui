import { db, schema } from "@novstash-ui/db";
import { eq } from "drizzle-orm";

export default defineOAuthGoogleEventHandler({
	async onSuccess(event, { user }) {
		await db
			.insert(schema.users)
			.values({
				id: user.sub,
				email: user.email,
				name: user.name,
				avatar: user.picture,
				createdAt: new Date().toISOString(),
			})
			.onConflictDoUpdate({
				target: schema.users.id,
				set: {
					email: user.email,
					name: user.name,
					avatar: user.picture,
				},
			})
			.execute();

		const created = await db
			.select({ role: schema.users.role })
			.from(schema.users)
			.where(eq(schema.users.id, user.sub))
			.limit(1);

		await setUserSession(event, {
			user: {
				id: user.sub,
				email: user.email,
				name: user.name,
				avatar: user.picture,
				role: created[0]?.role ?? "user",
			},
		});

		return sendRedirect(event, "/");
	},

	onError(event, error) {
		console.error("Google OAuth error:", error);
		return sendRedirect(event, "/?auth=error");
	},
});
