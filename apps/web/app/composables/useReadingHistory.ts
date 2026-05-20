interface ReadingHistoryEntry {
	id: number;
	novelSlug: string;
	chapterIdx: number;
	chapterTitle: string | null;
	updatedAt: string | null;
	novel?: {
		slug: string;
		title: string;
		author: string | null;
		coverUrl: string | null;
	} | null;
}

export function useReadingHistory() {
	async function saveProgress(
		novelSlug: string,
		chapterIdx: number,
		chapterTitle?: string | null,
	) {
		await $fetch("/api/reading/progress", {
			method: "POST",
			body: { novelSlug, chapterIdx, chapterTitle },
		});
	}

	async function getRecentReads(): Promise<ReadingHistoryEntry[]> {
		return $fetch<ReadingHistoryEntry[]>("/api/reading/recent");
	}

	async function getProgress(slug: string): Promise<ReadingHistoryEntry> {
		return $fetch<ReadingHistoryEntry>(`/api/reading/progress/${slug}`);
	}

	return {
		saveProgress,
		getRecentReads,
		getProgress,
	};
}
