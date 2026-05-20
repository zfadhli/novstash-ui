import { db, schema } from "@novstash-ui/db";

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

		await setUserSession(event, {
			user: {
				id: user.sub,
				email: user.email,
				name: user.name,
				avatar: user.picture,
			},
		});

		return sendRedirect(event, "/");
	},

	onError(event, error) {
		console.error("Google OAuth error:", error);
		return sendRedirect(event, "/?auth=error");
	},
});
