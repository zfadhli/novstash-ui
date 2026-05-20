import { useRoute, useRouter } from "vue-router";

export function useScrollMemory(when?: Ref<boolean>) {
	const route = useRoute();
	const router = useRouter();

	// Restore scroll position only when the when signal is truthy
	// (content has loaded). This prevents scrolling against a tiny
	// loading-spinner DOM before async chapter data arrives.
	watchEffect(() => {
		if (when && !when.value) return;
		const scroll = Number(route.query.scroll) || 0;
		if (scroll > 0) {
			nextTick(() => {
				window.scrollTo({ top: scroll, behavior: "instant" });
			});
		}
	});

	// Debounced scroll handler to save position to URL
	let saveTimeout: ReturnType<typeof setTimeout> | null = null;
	function onScroll() {
		if (saveTimeout) clearTimeout(saveTimeout);
		saveTimeout = setTimeout(() => {
			const scrollY = window.scrollY;
			if (scrollY > 0) {
				router.replace({ query: { ...route.query, scroll: String(scrollY) } });
			} else {
				// Remove scroll param if at top
				const { scroll: _, ...rest } = route.query;
				router.replace({ query: rest });
			}
		}, 150);
	}

	onMounted(() => {
		window.addEventListener("scroll", onScroll, { passive: true });
	});

	onUnmounted(() => {
		window.removeEventListener("scroll", onScroll);
		// Save final position before leaving
		const scrollY = window.scrollY;
		if (scrollY > 0) {
			router.replace({ query: { ...route.query, scroll: String(scrollY) } });
		} else {
			const { scroll: _, ...rest } = route.query;
			router.replace({ query: rest });
		}
	});

	return {
		clearScroll: () => {
			const { scroll: _, ...rest } = route.query;
			router.replace({ query: rest });
		},
	};
}
