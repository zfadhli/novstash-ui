export interface Novel {
	id: string;
	title: string;
	author: string | null;
	coverUrl: string | null;
	synopsis: string | null;
	status: string | null;
	source: string | null;
	sourceUrl: string | null;
	genres: string | null;
	rating: number | null;
	chapterCount: number | null;
	createdAt: string | null;
	updatedAt: string | null;
}

export interface Chapter {
	id: string;
	novelId: string;
	number: number;
	title: string | null;
	content: string;
	createdAt: string | null;
	updatedAt: string | null;
}

export interface ChapterNavigation {
	id: string;
	number: number;
	title: string | null;
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
