import type { Novel } from "~/types/novel";

export function useAdminNovels() {
	const key = "admin-novels";

	const { data, pending, error, refresh } = useAsyncData(key, async () => {
		return $fetch<{ items: Novel[] }>("/api/admin/novels");
	});

	const novels = computed(() => data.value?.items ?? []);
	const total = computed(() => novels.value.length);

	return {
		novels,
		total,
		pending,
		error,
		refresh,
	};
}
