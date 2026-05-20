import type { ChapterWithNav } from "~/types/novel";

/**
 * Composable to prefetch the next chapter's content in the background.
 *
 * Usage:
 *   const { prefetched, useCached } = useChapterPrefetch(novelSlug, chapterIdx)
 *   // When the next chapter link is available, the composable automatically
 *   // fetches its content and stores it in `prefetched`.
 *   // On chapter change, call `useCached()` to return cached data if available.
 */
export function useChapterPrefetch(
	novelSlug: MaybeRefOrGetter<string>,
	currentChapterIdx: MaybeRefOrGetter<number>,
) {
	const slug = toRef(novelSlug);
	const idx = ref(toValue(currentChapterIdx));

	const cache = new Map<string, ChapterWithNav>();

	const prefetched = ref<ChapterWithNav | null>(null);

	// Watch for chapter changes to prefetch the next one
	watch(
		[slug, idx],
		async ([newSlug, newIdx]) => {
			prefetched.value = null;

			// Attempt to prefetch chapter (newIdx + 1)
			const nextIdx = newIdx + 1;
			const cacheKey = `${newSlug}/${nextIdx}`;

			// Already cached?
			if (cache.has(cacheKey)) {
				prefetched.value = cache.get(cacheKey) ?? null;
				return;
			}

			try {
				const data = await $fetch<ChapterWithNav>(
					`/api/novels/${newSlug}/chapters/${nextIdx}`,
				);
				cache.set(cacheKey, data);
				prefetched.value = data;
			} catch {
				// Next chapter may not exist — that's fine
				prefetched.value = null;
			}
		},
		{ immediate: true },
	);

	/**
	 * Consume the cached prefetched data for instant navigation.
	 * Returns the cached chapter and clears it.
	 */
	function useCached(): ChapterWithNav | null {
		const data = prefetched.value;
		prefetched.value = null;
		return data;
	}

	return {
		prefetched,
		useCached,
	};
}
