export interface Novel {
	slug: string;
	title: string;
	author: string | null;
	status: string | null;
	genres: string | null; // JSON array as text
	description: string | null;
	coverUrl: string | null;
	chapterCount: number | null;
	createdAt: string | null;
}

export interface Chapter {
	id: number;
	novelSlug: string;
	idx: number;
	title: string;
	url: string | null;
	contentMd: string | null;
	createdAt: string | null;
}

export interface ChapterNavigation {
	id: number;
	idx: number;
	title: string;
}

export interface ChapterWithNav extends Chapter {
	prevChapter: ChapterNavigation | null;
	nextChapter: ChapterNavigation | null;
}

export interface PaginatedResponse<T> {
	items: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}
