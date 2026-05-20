<script setup lang="ts">
import type { Novel } from "~/types/novel";
import NovelCard from "./NovelCard.vue";

defineProps<{
	novels: Novel[];
	pending?: boolean;
}>();
</script>

<template>
	<div>
		<!-- Loading skeleton -->
		<div
			v-if="pending"
			class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
		>
			<div
				v-for="i in 12"
				:key="i"
				class="animate-pulse rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
			>
				<div class="aspect-[3/4] rounded-t-xl bg-neutral-200 dark:bg-neutral-700" />
				<div class="space-y-2 p-3.5">
					<div class="h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700" />
					<div class="h-3 w-1/2 rounded bg-neutral-200 dark:bg-neutral-700" />
				</div>
			</div>
		</div>

		<!-- Empty state -->
		<div
			v-else-if="novels.length === 0"
			class="flex flex-col items-center justify-center py-20 text-neutral-400 dark:text-neutral-500"
		>
			<Icon name="lucide:book-open" class="mb-4 size-12" />
			<p class="text-lg font-medium">No novels found</p>
			<p class="mt-1 text-sm">Try adjusting your search or check back later.</p>
		</div>

		<!-- Novel grid -->
		<div
			v-else
			class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
		>
			<NovelCard
				v-for="(novel, index) in novels"
				:key="novel.id"
				:novel="novel"
				:index="index"
			/>
		</div>
	</div>
</template>
