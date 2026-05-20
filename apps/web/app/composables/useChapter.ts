import type { ChapterWithNav } from "~/types/novel";

export function useChapter(
	novelId: MaybeRefOrGetter<string>,
	chapterId: MaybeRefOrGetter<string>,
) {
	const nid = toRef(novelId);
	const cid = toRef(chapterId);

	const { data, pending, error, refresh } = useAsyncData(
		`chapter-${toValue(nid)}-${toValue(cid)}`,
		async () => {
			return $fetch<ChapterWithNav>(
				`/api/novels/${toValue(nid)}/chapters/${toValue(cid)}`,
			);
		},
		{ watch: [nid, cid] },
	);

	const chapter = computed(() => data.value ?? null);

	return {
		chapter,
		pending,
		error,
		refresh,
	};
}
