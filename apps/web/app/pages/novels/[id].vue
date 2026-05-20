<script setup lang="ts">
const route = useRoute();
const novelId = route.params.id as string;

const { novel, chapters, pending, error } = useNovel(novelId);
const { getProgress } = useReadingHistory();
const serverProgress = ref<Awaited<ReturnType<typeof getProgress>> | null>(
	null,
);

onMounted(async () => {
	const slug = novel.value?.slug;
	if (slug) {
		try {
			serverProgress.value = await getProgress(slug);
		} catch {
			serverProgress.value = null;
		}
	}
});

const firstChapterIdx = computed(() => chapters.value[0]?.idx ?? 0);

const showContinueReading = computed(() => {
	if (!serverProgress.value) return false;
	// Only show "Continue Reading" if saved progress is NOT the first chapter
	return serverProgress.value.chapterIdx !== firstChapterIdx.value;
});
</script>

<template>
	<UContainer class="py-8">
		<!-- Loading -->
		<div
			v-if="pending"
			class="animate-pulse space-y-6"
		>
			<div class="flex gap-8">
				<div class="aspect-[3/4] w-48 rounded-xl bg-neutral-200 dark:bg-neutral-700" />
				<div class="flex-1 space-y-3">
					<div class="h-8 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700" />
					<div class="h-4 w-1/3 rounded bg-neutral-200 dark:bg-neutral-700" />
					<div class="h-4 w-1/4 rounded bg-neutral-200 dark:bg-neutral-700" />
					<div class="mt-4 space-y-2">
						<div class="h-3 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
						<div class="h-3 w-5/6 rounded bg-neutral-200 dark:bg-neutral-700" />
						<div class="h-3 w-4/6 rounded bg-neutral-200 dark:bg-neutral-700" />
					</div>
				</div>
			</div>
		</div>

		<!-- Error -->
		<div
			v-else-if="error"
			class="flex flex-col items-center justify-center py-20 text-neutral-400 dark:text-neutral-500"
		>
			<Icon name="lucide:alert-circle" class="mb-4 size-12" />
			<p class="text-lg font-medium">Novel not found</p>
			<UButton
				to="/"
				variant="soft"
				class="mt-4"
			>
				Back to home
			</UButton>
		</div>

		<!-- Novel content -->
		<template v-else-if="novel">
			<!-- Back link -->
			<UButton
				to="/"
				variant="ghost"
				size="sm"
				class="mb-6"
			>
				<Icon name="lucide:arrow-left" class="mr-1 size-4" />
				Back to browse
			</UButton>

			<!-- Hero section -->
			<div class="flex flex-col gap-8 sm:flex-row">
				<!-- Cover -->
				<div class="shrink-0">
					<div class="aspect-[3/4] w-48 overflow-hidden rounded-xl bg-neutral-100 shadow-md dark:bg-neutral-800">
						<img
							v-if="novel.coverUrl"
							:src="novel.coverUrl"
							:alt="novel.title"
							class="size-full object-cover"
						/>
						<div
							v-else
							class="flex size-full items-center justify-center"
						>
							<span class="text-5xl font-bold text-neutral-300 dark:text-neutral-600">
								{{ novel.title.charAt(0).toUpperCase() }}
							</span>
						</div>
					</div>
				</div>

				<!-- Info -->
				<div class="flex flex-1 flex-col gap-3">
					<div class="flex items-start gap-3">
						<h1 class="font-serif text-3xl font-bold text-neutral-900 dark:text-neutral-50">
							{{ novel.title }}
						</h1>
						<span
							v-if="novel.status"
							class="mt-1.5 shrink-0 rounded-full bg-emerald-500/10 px-3 py-0.5 text-xs font-medium capitalize text-emerald-600 dark:text-emerald-400"
						>
							{{ novel.status }}
						</span>
					</div>

					<p
						v-if="novel.author"
						class="text-neutral-500 dark:text-neutral-400"
		>
						by <span class="font-medium text-neutral-700 dark:text-neutral-300">{{ novel.author }}</span>
					</p>

					<div class="flex flex-wrap gap-4 text-sm text-neutral-400 dark:text-neutral-500">
						<span
							v-if="novel.chapterCount"
							class="flex items-center gap-1"
						>
							<Icon name="lucide:file-text" class="size-4" />
							{{ novel.chapterCount }} chapter{{ novel.chapterCount !== 1 ? "s" : "" }}
						</span>
					</div>

					<!-- Genres -->
					<div
						v-if="novel.genres"
						class="flex flex-wrap gap-1.5"
					>
						<span
							v-for="genre in JSON.parse(novel.genres)"
							:key="genre"
							class="rounded-md bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
						>
							{{ genre }}
						</span>
					</div>

					<!-- Description -->
					<div
						v-if="novel.description"
						class="mt-2"
					>
						<h3 class="mb-2 text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
							Description
						</h3>
						<p class="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 whitespace-pre-line">
							{{ novel.description }}
						</p>
					</div>

					<!-- Action buttons -->
					<div class="mt-4 flex flex-wrap items-center gap-3">
						<!-- Start Reading — always first chapter -->
						<UButton
							v-if="chapters.length > 0"
							:to="`/read/${novel.slug}/${chapters[0].idx}`"
							size="lg"
						>
							<Icon name="lucide:book-open" class="mr-2 size-5" />
							Start Reading
						</UButton>

						<!-- Continue Reading — only if saved progress exists and isn't first chapter -->
						<UButton
							v-if="showContinueReading"
							:to="`/read/${novel.slug}/${serverProgress.value!.chapterIdx}`"
							size="lg"
						>
							<Icon name="lucide:book-open" class="mr-2 size-5" />
							Continue Reading (Ch. {{ serverProgress.value!.chapterIdx }})
						</UButton>
					</div>
				</div>
			</div>

			<!-- Chapter list -->
			<section class="mt-12">
				<h2 class="mb-4 font-serif text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
					Chapters
				</h2>
				<ChapterList
					:chapters="chapters"
					:novel-slug="novel.slug"
				/>
			</section>
		</template>
	</UContainer>
</template>
