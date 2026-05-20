import type { Novel, PaginatedResponse } from "~/types/novel";

export function useNovelSearch() {
	const query = ref("");
	const genre = ref<string[]>([]);
	const status = ref("");
	const sort = ref("newest");
	const page = ref(1);
	const limit = ref(20);

	const key = computed(
		() =>
			`novel-search-${query.value}-${genre.value.join(",")}-${status.value}-${sort.value}-${page.value}-${limit.value}`,
	);

	const { data, pending, error, refresh } = useAsyncData(
		key,
		async () => {
			const params = new URLSearchParams();
			if (query.value) params.set("q", query.value);
			if (genre.value.length > 0) params.set("genre", genre.value.join(","));
			if (status.value) params.set("status", status.value);
			if (sort.value) params.set("sort", sort.value);
			params.set("page", String(page.value));
			params.set("limit", String(limit.value));

			return $fetch<PaginatedResponse<Novel>>(
				`/api/novels/search?${params.toString()}`,
			);
		},
		{ watch: [query, genre, status, sort, page, limit] },
	);

	const novels = computed(() => data.value?.items ?? []);
	const total = computed(() => data.value?.total ?? 0);
	const totalPages = computed(() => data.value?.totalPages ?? 0);
	const hasMore = computed(() => page.value < totalPages.value);
	const hasFilters = computed(
		() =>
			query.value !== "" ||
			genre.value.length > 0 ||
			status.value !== "" ||
			sort.value !== "newest",
	);

	function resetFilters() {
		genre.value = [];
		status.value = "";
		sort.value = "newest";
		page.value = 1;
	}

	function setQuery(val: string) {
		query.value = val;
		page.value = 1;
	}

	function toggleGenre(g: string) {
		const idx = genre.value.indexOf(g);
		if (idx >= 0) {
			genre.value.splice(idx, 1);
		} else {
			genre.value.push(g);
		}
		page.value = 1;
	}

	function setStatus(s: string) {
		status.value = status.value === s ? "" : s;
		page.value = 1;
	}

	function setSort(s: string) {
		sort.value = s;
		page.value = 1;
	}

	return {
		// State
		query,
		genre,
		status,
		sort,
		page,
		limit,
		// Computed
		novels,
		total,
		totalPages,
		hasMore,
		hasFilters,
		// Actions
		pending,
		error,
		refresh,
		resetFilters,
		setQuery,
		toggleGenre,
		setStatus,
		setSort,
	};
}
