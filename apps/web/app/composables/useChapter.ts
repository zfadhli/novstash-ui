import type { ChapterWithNav } from "~/types/novel";

export function useChapter(
	novelId: MaybeRefOrGetter<string>,
	chapterIdx: MaybeRefOrGetter<number>,
) {
	const nid = toRef(novelId);
	const cidx = toRef(chapterIdx);

	const { data, pending, error, refresh } = useAsyncData(
		`chapter-${toValue(nid)}-${toValue(cidx)}`,
		async () => {
			return $fetch<ChapterWithNav>(
				`/api/novels/${toValue(nid)}/chapters/${toValue(cidx)}`,
			);
		},
		{ watch: [nid, cidx] },
	);

	const chapter = computed(() => data.value ?? null);

	return {
		chapter,
		pending,
		error,
		refresh,
	};
}
