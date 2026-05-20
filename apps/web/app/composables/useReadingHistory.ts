import { $fetch } from "ofetch";

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
		try {
			await $fetch("/api/reading/progress", {
				method: "POST",
				body: { novelSlug, chapterIdx, chapterTitle: chapterTitle ?? null },
			});
		} catch (e) {
			console.error("Failed to save reading progress:", e);
		}
	}

	async function getRecentReads(): Promise<ReadingHistoryEntry[]> {
		try {
			return await $fetch<ReadingHistoryEntry[]>("/api/reading/recent");
		} catch (e) {
			console.error("Failed to fetch recent reads:", e);
			return [];
		}
	}

	async function getProgress(
		slug: string,
	): Promise<ReadingHistoryEntry | null> {
		try {
			return await $fetch<ReadingHistoryEntry>(`/api/reading/progress/${slug}`);
		} catch (e) {
			console.error("Failed to fetch progress:", e);
			return null;
		}
	}

	return {
		saveProgress,
		getRecentReads,
		getProgress,
	};
}
