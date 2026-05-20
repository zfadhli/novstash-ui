export interface ReadingProgress {
	slug: string;
	idx: number;
	title: string;
	timestamp: number;
	scrollPosition?: number;
}

const STORAGE_KEY = "novstash-reading-progress";

function readStorage(): Record<string, ReadingProgress> {
	if (!import.meta.client) return {};
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored ? JSON.parse(stored) : {};
	} catch {
		return {};
	}
}

function writeStorage(data: Record<string, ReadingProgress>) {
	if (import.meta.client) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	}
}

/**
 * Composable for tracking and retrieving reading progress per novel.
 *
 * Usage (reader page — save progress):
 *   const { saveProgress } = useReadingProgress()
 *   watch(chapter, (c) => { if (c) saveProgress(c.novelSlug, c.idx, c.title) })
 *
 * Usage (novel detail page — check progress):
 *   const { continueReading } = useReadingProgress(() => novel.value?.slug)
 *   // continueReading is a computed<ReadingProgress | null>
 */
export function useReadingProgress(novelSlug?: MaybeRefOrGetter<string>) {
	const slug = toRef(novelSlug ?? "");

	// Reactive store — initialized from localStorage, updated on save
	const allProgress = useState<Record<string, ReadingProgress>>(
		"novstash-reading-progress",
		() => readStorage(),
	);

	/** Persist the current in-memory state to localStorage. */
	function persist() {
		writeStorage(allProgress.value);
	}

	/**
	 * Save progress for a given novel chapter.
	 * Call this when a chapter loads successfully.
	 */
	function saveProgress(
		newSlug: string,
		idx: number,
		title?: string | null,
		scrollPosition?: number,
	) {
		allProgress.value = {
			...allProgress.value,
			[newSlug]: {
				slug: newSlug,
				idx,
				title: title ?? `Chapter ${idx}`,
				timestamp: Date.now(),
				scrollPosition:
					scrollPosition ?? allProgress.value[newSlug]?.scrollPosition,
			},
		};
		persist();
	}

	/**
	 * Manually retrieve saved progress for a novel slug.
	 */
	function getProgress(slugToCheck: string): ReadingProgress | null {
		return allProgress.value[slugToCheck] ?? null;
	}

	/**
	 * Reactive computed that resolves to saved progress for the novel slug
	 * passed to the composable (or null if none).
	 */
	const continueReading = computed((): ReadingProgress | null => {
		if (!slug.value) return null;
		return allProgress.value[slug.value] ?? null;
	});

	return {
		saveProgress,
		getProgress,
		continueReading,
	};
}
