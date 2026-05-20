export interface ReadingProgress {
	slug: string;
	idx: number;
	title?: string;
	scrollPosition?: number;
}

function readStorage(): Record<string, ReadingProgress> {
	if (import.meta.client) {
		try {
			const raw = localStorage.getItem("novstash-reading-progress");
			if (raw) return JSON.parse(raw);
		} catch {
			// corrupt or inaccessible storage
		}
	}
	return {};
}

export function useReadingProgress() {
	// Always init with empty — useState never re-runs the init fn
	// on client after SSR because Nuxt uses the serialized SSR value.
	const allProgress = useState<Record<string, ReadingProgress>>(
		"novstash-reading-progress",
		() => ({}),
	);

	// Hydrate from localStorage on client
	if (import.meta.client && Object.keys(allProgress.value).length === 0) {
		const stored = readStorage();
		if (Object.keys(stored).length > 0) {
			allProgress.value = stored;
		}
	}

	function persist() {
		if (import.meta.client) {
			try {
				localStorage.setItem(
					"novstash-reading-progress",
					JSON.stringify(allProgress.value),
				);
			} catch {
				// storage full or unavailable
			}
		}
	}

	function saveProgress(
		slug: string,
		idx: number,
		title?: string | null,
		scrollPosition?: number,
	) {
		allProgress.value = {
			...allProgress.value,
			[slug]: {
				slug,
				idx,
				title: title ?? undefined,
				scrollPosition:
					scrollPosition !== undefined
						? scrollPosition
						: allProgress.value[slug]?.scrollPosition,
			},
		};
		persist();
	}

	function getProgress(slug: string): ReadingProgress | null {
		return allProgress.value[slug] ?? null;
	}

	const continueReading = computed(() => {
		const entries = Object.values(allProgress.value).filter((p) => p.idx > 0);
		if (entries.length === 0) return null;
		return entries.reduce((latest, current) =>
			current.idx > latest.idx ? current : latest,
		);
	});

	return {
		continueReading,
		saveProgress,
		getProgress,
	};
}
