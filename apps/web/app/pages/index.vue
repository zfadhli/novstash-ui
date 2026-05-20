<script setup lang="ts">
import type { RecentlyRead } from "~/types/library";

interface PaginationItem {
	type: "page" | "ellipsis";
	value: number;
}

function computedPaginationRange(
	total: number,
	current: number,
): PaginationItem[] {
	if (total <= 7) {
		return Array.from({ length: total }, (_, i) => ({
			type: "page" as const,
			value: i + 1,
		}));
	}

	const pages: PaginationItem[] = [];

	// Always show first page
	pages.push({ type: "page", value: 1 });

	if (current > 4) {
		pages.push({ type: "ellipsis", value: -1 });
	}

	const start = Math.max(2, current - 2);
	const end = Math.min(total - 1, current + 2);

	for (let i = start; i <= end; i++) {
		pages.push({ type: "page", value: i });
	}

	if (current < total - 3) {
		pages.push({ type: "ellipsis", value: -2 });
	}

	// Always show last page
	if (total > 1) {
		pages.push({ type: "page", value: total });
	}

	return pages;
}

const searchInput = ref("");

const { novels, total, pending, page, totalPages } = useNovels({
	search: ref(""),
	limit: 24,
});

// Debounce search input: wait 300ms after the user stops typing
// then navigate to the search page
let searchTimer: ReturnType<typeof setTimeout> | null = null;
watch(searchInput, (val) => {
	if (searchTimer) clearTimeout(searchTimer);
	searchTimer = setTimeout(() => {
		if (val.trim()) {
			navigateTo({ path: "/search", query: { q: val.trim() } });
		}
	}, 300);
});

onUnmounted(() => {
	if (searchTimer) clearTimeout(searchTimer);
});

// Continue reading
const recentReads = ref<RecentlyRead[]>([]);
const recentPending = ref(true);

// Intentional client-only fetch: the session cookie isn't available during SSR
// for unauthenticated users, so Continue Reading must be hydrated on the client.
// This is acceptable since it's a dynamic user-specific section.
onMounted(async () => {
	const { getRecentReads } = useReadingHistory();
	try {
		recentReads.value = (await getRecentReads()) as unknown as RecentlyRead[];
	} catch {
		// API error — hide section
	} finally {
		recentPending.value = false;
	}
});
</script>

<template>
	<UContainer class="py-8">
		<!-- Hero -->
		<section class="mb-12 text-center">
			<h1 class="font-serif text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-6xl">
				Novstash
			</h1>
			<p class="mt-3 text-lg text-neutral-500 dark:text-neutral-400">
				Browse, read, and collect your favorite web novels.
			</p>

			<!-- Search -->
			<div class="mx-auto mt-8 max-w-lg">
				<div class="relative">
					<Icon
						name="lucide:search"
						class="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 size-5 text-neutral-400"
					/>
					<input
						v-model="searchInput"
						type="text"
						placeholder="Search novels..."
						class="w-full rounded-xl border border-neutral-300 bg-white py-3 pr-4 pl-12 text-sm text-neutral-900 placeholder-neutral-400 shadow-sm transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:border-emerald-400"
					/>
				</div>
			</div>
		</section>

		<!-- Continue Reading -->
		<section
			v-if="!recentPending && recentReads.length > 0"
			class="mb-12"
		>
			<div class="mb-4 flex items-center gap-2">
				<Icon
					name="lucide:book-marked"
					class="size-5 text-emerald-500"
				/>
				<h2 class="font-serif text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
					Continue Reading
				</h2>
			</div>

			<div class="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
				<NuxtLink
					v-for="entry in recentReads"
					:key="entry.slug"
					:to="`/novels/${entry.novel.slug}`"
					class="group flex-shrink-0 w-36 overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1 dark:border-neutral-800 dark:bg-neutral-900"
				>
					<!-- Thumbnail -->
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
							<span class="text-2xl font-bold text-neutral-300 dark:text-neutral-600">
								{{ entry.novel.title.charAt(0).toUpperCase() }}
							</span>
						</div>

						<!-- Chapter badge -->
						<span class="absolute right-2 bottom-2 rounded-full bg-emerald-500/90 px-2 py-0.5 text-xs font-semibold text-white shadow-sm backdrop-blur-sm">
							Ch. {{ entry.chapterIdx }}
						</span>
					</div>

					<!-- Info -->
					<div class="p-3">
						<h3 class="text-sm font-semibold leading-tight text-neutral-900 line-clamp-2 dark:text-neutral-100">
							{{ entry.novel.title }}
						</h3>
					</div>
				</NuxtLink>

				<!-- View all link -->
				<NuxtLink
					to="/library"
					class="group flex flex-shrink-0 w-36 items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 transition-all duration-300 hover:border-emerald-400 hover:bg-emerald-50/50 dark:border-neutral-700 dark:bg-neutral-800/50 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-900/20"
				>
					<div class="flex flex-col items-center gap-1.5 text-neutral-400 group-hover:text-emerald-500 dark:text-neutral-500 dark:group-hover:text-emerald-400">
						<Icon name="lucide:arrow-right" class="size-5" />
						<span class="text-xs font-medium">View All</span>
					</div>
				</NuxtLink>
			</div>
		</section>

		<!-- Novel grid -->
		<section>
			<div class="mb-6 flex items-center justify-between">
				<h2 class="font-serif text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
					Browse Novels
				</h2>
				<span
					v-if="total > 0"
					class="text-sm text-neutral-400 dark:text-neutral-500"
				>
					{{ total }} novel{{ total !== 1 ? "s" : "" }}
				</span>
			</div>

			<NovelGrid
				:novels="novels"
				:pending="pending"
			/>

			<!-- Pagination -->
			<div
				v-if="totalPages > 1"
				class="mt-10 flex items-center justify-center gap-2"
			>
				<UButton
					variant="soft"
					:disabled="page <= 1"
					@click="page--"
				>
					Previous
				</UButton>

				<div class="flex items-center gap-1">
					<template v-for="p in computedPaginationRange(totalPages, page)" :key="p.value">
						<span v-if="p.type === 'ellipsis'" class="px-2 text-neutral-400 dark:text-neutral-500">...</span>
						<UButton
							v-else
							:variant="p.value === page ? 'solid' : 'soft'"
							size="sm"
							@click="page = p.value"
						>
							{{ p.value }}
						</UButton>
					</template>
				</div>

				<UButton
					variant="soft"
					:disabled="page >= totalPages"
					@click="page++"
				>
					Next
				</UButton>
			</div>
		</section>

		<!-- Empty state when no novels in DB -->
		<section
			v-if="!pending && novels.length === 0 && !search"
			class="mt-12 rounded-xl border border-dashed border-neutral-300 p-12 text-center dark:border-neutral-700"
		>
			<Icon
				name="lucide:library"
				class="mx-auto mb-4 size-12 text-neutral-300 dark:text-neutral-600"
			/>
			<h3 class="font-serif text-xl font-semibold text-neutral-700 dark:text-neutral-300">
				Your library is empty
			</h3>
			<p class="mt-2 max-w-md mx-auto text-sm text-neutral-400 dark:text-neutral-500">
				Use the novstash-cli to download novels and populate the database.
				Once novels are added, they'll appear here.
			</p>
			<div class="mt-6 rounded-lg bg-neutral-50 p-4 text-left font-mono text-xs text-neutral-500 dark:bg-neutral-800/50 dark:text-neutral-400">
				<p class="mb-1 font-semibold text-neutral-700 dark:text-neutral-300">Quick start:</p>
				<code class="block">pip install novstash-cli</code>
				<code class="block mt-1">novstash download &lt;novel-url&gt;</code>
			</div>
		</section>
	</UContainer>
</template>
