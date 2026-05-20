export default defineNuxtRouteMiddleware(() => {
	const { loggedIn, isAdmin } = useUser();
	if (!loggedIn.value || !isAdmin.value) {
		return navigateTo("/");
	}
});
