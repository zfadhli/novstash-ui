import type { Ref } from "vue";

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

export function useReadingProgress(slugRef?: Ref<string | undefined | null>) {
	const allProgress = useState<Record<string, ReadingProgress>>(
		"novstash-reading-progress",
		() => {
			if (import.meta.client) return readStorage();
			return {};
		},
	);

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

	// Continue Reading returns the latest-read chapter.
	// If slugRef is provided, filter to only that novel;
	// otherwise returns global latest (used on home page).
	const continueReading = computed(() => {
		const entries = Object.values(allProgress.value).filter((p) => {
			if (slugRef?.value && p.slug !== slugRef.value) return false;
			return p.idx > 0;
		});
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
