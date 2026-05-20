/**
 * Composable to save & restore scroll position in sessionStorage per chapter.
 *
 * Usage:
 *   const { containerRef } = useScrollMemory(novelSlug, chapterIdx)
 *   // Then bind containerRef to the scrollable article element:
 *   <article ref="containerRef">
 */

const STORAGE_PREFIX = "read";

function getKey(slug: string, chapterIdx: number): string {
	return `${STORAGE_PREFIX}/${slug}/${chapterIdx}`;
}

function save(key: string, position: number) {
	if (!import.meta.client) return;
	try {
		sessionStorage.setItem(key, String(position));
	} catch {
		// sessionStorage may be full or unavailable
	}
}

function load(key: string): number | null {
	if (!import.meta.client) return null;
	try {
		const v = sessionStorage.getItem(key);
		return v ? Number(v) : null;
	} catch {
		return null;
	}
}

function remove(key: string) {
	if (!import.meta.client) return;
	try {
		sessionStorage.removeItem(key);
	} catch {
		// ignore
	}
}

export function useScrollMemory(
	slug: MaybeRefOrGetter<string>,
	chapterIdx: MaybeRefOrGetter<number>,
) {
	const resolvedSlug = toRef(slug);
	const resolvedIdx = ref(toValue(chapterIdx));
	const containerRef = ref<HTMLElement | null>(null);

	const key = computed(() =>
		getKey(toValue(resolvedSlug), toValue(resolvedIdx)),
	);

	// Restore scroll position after content renders
	onMounted(async () => {
		await nextTick();
		const el = containerRef.value;
		if (!el) return;

		const saved = load(key.value);
		if (saved != null && saved > 0) {
			el.scrollTop = saved;
		}
	});

	// Save scroll position before leaving
	onUnmounted(() => {
		const el = containerRef.value;
		if (el) {
			save(key.value, el.scrollTop);
		}
	});

	// Watch for route changes (e.g., navigating between chapters) and save
	// the old scroll position while restoring the new one
	watch(resolvedIdx, (_newIdx, oldIdx) => {
		const el = containerRef.value;
		if (el && oldIdx != null) {
			// Save old position
			const oldKey = getKey(toValue(resolvedSlug), oldIdx);
			save(oldKey, el.scrollTop);

			// Restore new position after DOM updates
			nextTick(() => {
				const newKey = getKey(toValue(resolvedSlug), toValue(resolvedIdx));
				const saved = load(newKey);
				if (saved != null && saved > 0) {
					el.scrollTop = saved;
				}
			});
		}
	});

	function clearMemory() {
		remove(key.value);
	}

	return {
		containerRef,
		clearMemory,
	};
}
