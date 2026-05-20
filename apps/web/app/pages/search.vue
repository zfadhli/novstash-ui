<script setup lang="ts">
const route = useRoute();
const router = useRouter();

const {
	query,
	genre,
	status,
	sort,
	page,
	novels,
	total,
	totalPages,
	pending,
	resetFilters,
	setQuery,
	toggleGenre,
	setStatus,
	setSort,
} = useNovelSearch();
const { genres: allGenres, pending: genresPending } = useGenres();

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

// Sync initial query from URL
onMounted(() => {
	const q = route.query.q as string | undefined;
	if (q) {
		searchInput.value = q;
		setQuery(q);
	}
	// Auto-focus on desktop
	if (window.innerWidth >= 768) {
		nextTick(() => {
			const input =
				document.querySelector<HTMLInputElement>("#search-page-input");
			input?.focus();
		});
	}
});

// When query/page changes, update URL
watch([query, genre, status, sort, page], () => {
	const params: Record<string, string> = {};
	if (query.value) params.q = query.value;
	if (genre.value.length > 0) params.genre = genre.value.join(",");
	if (status.value) params.status = status.value;
	if (sort.value !== "newest") params.sort = sort.value;
	if (page.value > 1) params.page = String(page.value);

	router.push({ path: "/search", query: params });
});

// Debounced search
let searchTimer: ReturnType<typeof setTimeout> | null = null;
watch(searchInput, (val) => {
	if (searchTimer) clearTimeout(searchTimer);
	searchTimer = setTimeout(() => {
		setQuery(val);
	}, 300);
});

onUnmounted(() => {
	if (searchTimer) clearTimeout(searchTimer);
});

const sortOptions = [
	{ label: "Newest", value: "newest" },
	{ label: "Title", value: "title" },
	{ label: "Most Chapters", value: "chapters" },
	{ label: "Last Updated", value: "updated" },
];

const statusOptions = [
	{ label: "All", value: "" },
	{ label: "Ongoing", value: "ongoing" },
	{ label: "Completed", value: "completed" },
	{ label: "Hiatus", value: "hiatus" },
];

function selectStatus(s: string) {
	setStatus(s);
}

function selectGenre(g: string) {
	toggleGenre(g);
}
</script>

<template>
	<UContainer class="py-8">
		<!-- Search input -->
		<section class="mb-8">
			<div class="relative mx-auto max-w-2xl">
				<Icon
					name="lucide:search"
					class="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 size-5 text-neutral-400"
				/>
				<input
					id="search-page-input"
					v-model="searchInput"
					type="text"
					placeholder="Search novels..."
					class="w-full rounded-xl border border-neutral-300 bg-white py-3.5 pr-4 pl-12 text-base text-neutral-900 placeholder-neutral-400 shadow-sm transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:border-emerald-400"
				/>
			</div>
		</section>

		<!-- Filters -->
		<section class="mb-8 space-y-4">
			<!-- Genre chips -->
			<div
				v-if="!genresPending && allGenres.length > 0"
				class="flex flex-wrap items-center gap-2"
			>
				<span class="mr-1 text-sm font-medium text-neutral-500 dark:text-neutral-400">
					Genre:
				</span>
				<button
					v-for="g in allGenres"
					:key="g"
					:class="[
						'rounded-full px-3 py-1 text-xs font-medium transition-all',
						genre.includes(g)
							? 'bg-emerald-500 text-white shadow-sm'
							: 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
					]"
					@click="selectGenre(g)"
				>
					{{ g }}
				</button>
			</div>

			<!-- Status pills -->
			<div class="flex flex-wrap items-center gap-2">
				<span class="mr-1 text-sm font-medium text-neutral-500 dark:text-neutral-400">
					Status:
				</span>
				<button
					v-for="opt in statusOptions"
					:key="opt.value"
					:class="[
						'rounded-full px-3 py-1 text-xs font-medium transition-all',
						status === opt.value || (!status && opt.value === '')
							? 'bg-emerald-500 text-white shadow-sm'
							: 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
					]"
					@click="selectStatus(opt.value)"
				>
					{{ opt.label }}
				</button>
			</div>

			<!-- Sort + results count row -->
			<div class="flex flex-wrap items-center justify-between gap-3">
				<div class="flex items-center gap-2">
					<span class="text-sm font-medium text-neutral-500 dark:text-neutral-400">
						Sort:
					</span>
					<USelectMenu
						v-model="sort"
						:options="sortOptions"
						value-attribute="value"
						option-attribute="label"
						size="sm"
						class="w-44"
						@update:model-value="setSort"
					/>
				</div>

				<div
					v-if="!pending"
					class="text-sm text-neutral-500 dark:text-neutral-400"
				>
					<template v-if="query">
						<strong class="text-neutral-700 dark:text-neutral-200">{{ total }}</strong>
						result{{ total !== 1 ? "s" : "" }} found for
						<strong class="text-neutral-700 dark:text-neutral-200">"{{ query }}"</strong>
					</template>
					<template v-else>
						<strong class="text-neutral-700 dark:text-neutral-200">{{ total }}</strong>
						novel{{ total !== 1 ? "s" : "" }}
					</template>
				</div>
			</div>
		</section>

		<!-- Results -->
		<section>
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
	</UContainer>
</template>
