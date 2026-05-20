import type { Chapter, Novel } from "~/types/novel";

interface NovelWithChapters extends Novel {
	chapters: Chapter[];
}

export function useNovel(id: MaybeRefOrGetter<string>) {
	const novelId = toRef(id);

	const { data, pending, error, refresh } = useAsyncData(
		`novel-${toValue(novelId)}`,
		async () => {
			return $fetch<NovelWithChapters>(`/api/novels/${toValue(novelId)}`);
		},
		{ watch: [novelId] },
	);

	const novel = computed(() => data.value ?? null);
	const chapters = computed(() => data.value?.chapters ?? []);

	return {
		novel,
		chapters,
		pending,
		error,
		refresh,
	};
}
