<script setup lang="ts">
import { useNovels } from "~/composables/useNovels";

const search = ref("");

const { novels, total, pending, page, totalPages } = useNovels({
	search,
	limit: 24,
});

function onSearch() {
	page.value = 1;
}
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
						v-model="search"
						type="text"
						placeholder="Search novels..."
						class="w-full rounded-xl border border-neutral-300 bg-white py-3 pr-4 pl-12 text-sm text-neutral-900 placeholder-neutral-400 shadow-sm transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:border-emerald-400"
						@input="onSearch"
					/>
				</div>
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
					<UButton
						v-for="p in totalPages"
						:key="p"
						:variant="p === page ? 'solid' : 'soft'"
						size="sm"
						@click="page = p"
					>
						{{ p }}
					</UButton>
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
