export function useUser() {
	const { loggedIn, user, fetch, clear } = useUserSession();

	// Ensure session is fresh on client-side navigation.
	// SSR embeds the session in the HTML payload on hard refresh,
	// but client navigation doesn't re-run server plugins,
	// so we fetch from the server to hydrate the reactive state.
	if (import.meta.client) {
		callOnce("fetch-user-session", () => fetch());
	}

	const isAdmin = computed(
		() => (user.value as { role?: string } | null)?.role === "admin",
	);

	return {
		loggedIn,
		user,
		isAdmin,
		refresh: fetch,
		logout: clear,
	};
}
