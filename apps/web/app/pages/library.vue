<script setup lang="ts">
import type { RecentlyRead } from "~/types/library";

const { getRecentReads } = useReadingHistory();

const recentReads = ref<RecentlyRead[]>([]);
const pending = ref(true);

const sortMode = ref<"lastRead" | "title">("lastRead");

const sortedReads = computed(() => {
	const sorted = [...recentReads.value];
	if (sortMode.value === "title") {
		sorted.sort((a, b) => a.novel.title.localeCompare(b.novel.title));
	}
	// "lastRead" is already sorted by updatedAt desc from API
	return sorted;
});

onMounted(async () => {
	try {
		recentReads.value = (await getRecentReads()) as unknown as RecentlyRead[];
	} catch {
		// API error — keep empty
	} finally {
		pending.value = false;
	}
});
</script>

<template>
	<UContainer class="py-8">
		<!-- Header -->
		<section class="mb-8">
			<div class="flex items-center gap-3">
				<Icon name="lucide:library" class="size-7 text-emerald-500" />
				<h1 class="font-serif text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
					My Library
				</h1>
			</div>
			<p class="mt-2 text-neutral-500 dark:text-neutral-400">
				Pick up where you left off.
			</p>
		</section>

		<!-- Sort tabs -->
		<div
			v-if="recentReads.length > 0"
			class="mb-6 flex items-center gap-2 border-b border-neutral-200 pb-2 dark:border-neutral-800"
		>
			<button
				:class="[
					'rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors',
					sortMode === 'lastRead'
						? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
						: 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200',
				]"
				@click="sortMode = 'lastRead'"
			>
				Last Read
			</button>
			<button
				:class="[
					'rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors',
					sortMode === 'title'
						? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
						: 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200',
				]"
				@click="sortMode = 'title'"
			>
				Title
			</button>
		</div>

		<!-- Loading skeleton -->
		<div
			v-if="pending"
			class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
		>
			<div
				v-for="i in 6"
				:key="i"
				class="animate-pulse rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
			>
				<div class="aspect-[3/4] rounded-t-xl bg-neutral-200 dark:bg-neutral-700" />
				<div class="space-y-2 p-3.5">
					<div class="h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700" />
					<div class="h-3 w-1/2 rounded bg-neutral-200 dark:bg-neutral-700" />
					<div class="mt-2 h-3 w-2/3 rounded bg-neutral-200 dark:bg-neutral-700" />
				</div>
			</div>
		</div>

		<!-- Empty state -->
		<div
			v-else-if="sortedReads.length === 0"
			class="mt-12 flex flex-col items-center justify-center py-20"
		>
			<Icon
				name="lucide:book-open"
				class="mb-4 size-16 text-neutral-300 dark:text-neutral-600"
			/>
			<h3 class="font-serif text-xl font-semibold text-neutral-700 dark:text-neutral-300">
				Your library is empty
			</h3>
			<p class="mt-2 max-w-md text-center text-sm text-neutral-400 dark:text-neutral-500">
				Start reading a novel and it will appear here.
			</p>
			<UButton
				to="/"
				class="mt-6"
				variant="soft"
			>
				Browse Novels
			</UButton>
		</div>

		<!-- Grid of novels -->
		<div
			v-else
			class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
		>
			<NuxtLink
				v-for="entry in sortedReads"
				:key="entry.slug"
				:to="`/novels/${entry.novel.slug}`"
				class="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1 dark:border-neutral-800 dark:bg-neutral-900"
			>
				<!-- Cover image area -->
				<div class="relative aspect-[3/4] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
					<img
						v-if="entry.novel.coverUrl"
						:src="entry.novel.coverUrl"
						:alt="entry.novel.title"
						class="size-full object-cover transition-transform duration-500 group-hover:scale-105"
						loading="lazy"
					/>
					<div
						v-else
						class="flex size-full items-center justify-center"
					>
						<span class="text-4xl font-bold text-neutral-300 dark:text-neutral-600">
							{{ entry.novel.title.charAt(0).toUpperCase() }}
						</span>
					</div>

					<!-- Continue reading badge -->
					<span
						class="absolute right-2 bottom-2 rounded-full bg-emerald-500/90 px-2.5 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-sm"
					>
						Ch. {{ entry.chapterIdx }}
					</span>
				</div>

				<!-- Info -->
				<div class="flex flex-1 flex-col gap-1.5 p-3.5">
					<h3 class="font-semibold leading-tight text-neutral-900 line-clamp-2 dark:text-neutral-100">
						{{ entry.novel.title }}
					</h3>
					<p
						v-if="entry.novel.author"
						class="text-sm text-neutral-500 line-clamp-1 dark:text-neutral-400"
					>
						{{ entry.novel.author }}
					</p>

					<div class="mt-auto pt-1.5">
						<p
							v-if="entry.chapterTitle"
							class="text-xs text-emerald-600 dark:text-emerald-400 truncate"
						>
							{{ entry.chapterTitle }}
						</p>
						<span
							v-else-if="entry.novel.chapterCount"
							class="text-xs text-neutral-400 dark:text-neutral-500"
						>
							{{ entry.novel.chapterCount }} chapter{{ entry.novel.chapterCount !== 1 ? "s" : "" }}
						</span>
					</div>
				</div>
			</NuxtLink>
		</div>
	</UContainer>
</template>
