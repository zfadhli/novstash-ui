import type { Novel } from "./novel";

export interface RecentlyRead {
	slug: string;
	chapterIdx: number;
	chapterTitle: string | null;
	updatedAt: string | null;
	novel: Novel;
}
