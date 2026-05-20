<script setup lang="ts">
import type { Novel } from "~/types/novel";

const props = withDefaults(
	defineProps<{
		novel: Novel;
		index?: number;
	}>(),
	{ index: 0 },
);

const statusColors: Record<string, string> = {
	ongoing: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
	completed: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
	hiatus: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};
</script>

<template>
	<NuxtLink
		:to="`/novels/${novel.id}`"
		class="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1 dark:border-neutral-800 dark:bg-neutral-900"
	>
		<!-- Cover image area -->
		<div class="relative aspect-[3/4] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
			<img
				v-if="novel.coverUrl"
				:src="novel.coverUrl"
				:alt="novel.title"
				class="size-full object-cover transition-transform duration-500 group-hover:scale-105"
				loading="lazy"
			/>
			<div
				v-else
				class="flex size-full items-center justify-center"
			>
				<span class="text-4xl font-bold text-neutral-300 dark:text-neutral-600">
					{{ novel.title.charAt(0).toUpperCase() }}
				</span>
			</div>

			<!-- Status badge -->
			<span
				v-if="novel.status"
				class="absolute top-2 left-2 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize backdrop-blur-sm"
				:class="statusColors[novel.status] || 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400'"
			>
				{{ novel.status }}
			</span>
		</div>

		<!-- Info -->
		<div class="flex flex-1 flex-col gap-1.5 p-3.5">
			<h3 class="font-semibold leading-tight text-neutral-900 line-clamp-2 dark:text-neutral-100">
				{{ novel.title }}
			</h3>
			<p
				v-if="novel.author"
				class="text-sm text-neutral-500 line-clamp-1 dark:text-neutral-400"
			>
				{{ novel.author }}
			</p>

			<div class="mt-auto flex items-center gap-2 pt-1.5">
				<span
					v-if="novel.chapterCount"
					class="text-xs text-neutral-400 dark:text-neutral-500"
				>
					{{ novel.chapterCount }} chapters
				</span>
				<span
					v-if="novel.rating"
					class="ml-auto flex items-center gap-1 text-xs text-amber-500"
				>
					<Icon name="lucide:star" class="size-3.5 fill-current" />
					{{ novel.rating.toFixed(1) }}
				</span>
			</div>
		</div>
	</NuxtLink>
</template>
