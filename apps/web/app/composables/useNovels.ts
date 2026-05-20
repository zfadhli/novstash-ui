import type { Novel, PaginatedResponse } from "~/types/novel";

interface UseNovelsOptions {
	search?: MaybeRefOrGetter<string>;
	page?: MaybeRefOrGetter<number>;
	limit?: MaybeRefOrGetter<number>;
}

export function useNovels(options: UseNovelsOptions = {}) {
	const search = toRef(options.search ?? "");
	const page = toRef(options.page ?? 1);
	const limit = toRef(options.limit ?? 20);

	const key = computed(
		() => `novels-${search.value}-${page.value}-${limit.value}`,
	);

	const { data, pending, error, refresh } = useAsyncData(
		key,
		async () => {
			const params = new URLSearchParams();
			if (search.value) params.set("q", search.value);
			params.set("page", String(page.value));
			params.set("limit", String(limit.value));

			return $fetch<PaginatedResponse<Novel>>(
				`/api/novels?${params.toString()}`,
			);
		},
		{ watch: [search, page, limit] },
	);

	const novels = computed(() => data.value?.items ?? []);
	const total = computed(() => data.value?.total ?? 0);
	const totalPages = computed(() => data.value?.totalPages ?? 0);
	const hasMore = computed(() => page.value < totalPages.value);

	return {
		novels,
		total,
		totalPages,
		page,
		limit,
		hasMore,
		pending,
		error,
		refresh,
	};
}
