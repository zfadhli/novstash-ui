export function useUser() {
	const { loggedIn, user, fetch, clear } = useUserSession();

	return {
		loggedIn,
		user,
		refresh: fetch,
		logout: clear,
	};
}
