import type { Chapter } from "~/types/novel";

export function useChapterList(novelSlug: MaybeRefOrGetter<string>) {
	const slug = toRef(novelSlug);

	const { data, pending, error, refresh } = useAsyncData(
		`chapter-list-${toValue(slug)}`,
		async () => {
			const result = await $fetch<{
				items: Chapter[];
				total: number;
			}>(`/api/novels/${toValue(slug)}/chapters?limit=1000`);
			return result.items;
		},
		{ watch: [slug], default: () => [] },
	);

	const chapters = computed(() => data.value ?? []);

	return {
		chapters,
		pending,
		error,
		refresh,
	};
}
