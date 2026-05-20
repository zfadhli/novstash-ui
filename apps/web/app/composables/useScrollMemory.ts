export function useScrollMemory(when?: Ref<boolean>) {
	const route = useRoute();
	const router = useRouter();

	// Restore scroll position only once when content is ready
	const restored = ref(false);

	watch(
		() => (when ? when.value : true),
		(ready) => {
			if (!ready || restored.value) return;
			const scroll = Number(route.query.scroll) || 0;
			if (scroll > 0) {
				nextTick(() => {
					window.scrollTo({ top: scroll, behavior: "instant" });
					restored.value = true;
				});
			}
		},
		{ immediate: true },
	);

	// Debounced scroll handler to save position to URL
	let saveTimeout: ReturnType<typeof setTimeout> | null = null;
	function onScroll() {
		if (saveTimeout) clearTimeout(saveTimeout);
		saveTimeout = setTimeout(() => {
			const scrollY = window.scrollY;
			if (scrollY > 0) {
				router.replace({
					query: { ...route.query, scroll: String(scrollY) },
				});
			} else {
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
	});

	return {
		clearScroll: () => {
			const { scroll: _, ...rest } = route.query;
			router.replace({ query: rest });
		},
	};
}
