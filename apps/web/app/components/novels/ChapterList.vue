<script setup lang="ts">
import type { Chapter } from "~/types/novel";

defineProps<{
	chapters: Chapter[];
	novelId: string;
	pending?: boolean;
}>();
</script>

<template>
	<div>
		<!-- Loading -->
		<div
			v-if="pending"
			class="space-y-2"
		>
			<div
				v-for="i in 10"
				:key="i"
				class="h-12 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800"
			/>
		</div>

		<!-- Empty -->
		<div
			v-else-if="chapters.length === 0"
			class="flex flex-col items-center justify-center py-12 text-neutral-400 dark:text-neutral-500"
		>
			<Icon name="lucide:file-text" class="mb-3 size-10" />
			<p>No chapters available yet.</p>
		</div>

		<!-- Chapter list -->
		<div
			v-else
			class="divide-y divide-neutral-200 dark:divide-neutral-800"
		>
			<NuxtLink
				v-for="chapter in chapters"
				:key="chapter.id"
				:to="`/novels/${novelId}/chapters/${chapter.id}`"
				class="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
			>
				<span class="flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
					{{ chapter.number }}
				</span>
				<div class="min-w-0 flex-1">
					<p class="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
						{{ chapter.title || `Chapter ${chapter.number}` }}
					</p>
					<p
						v-if="chapter.createdAt"
						class="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500"
					>
						{{ new Date(chapter.createdAt).toLocaleDateString() }}
					</p>
				</div>
				<Icon
					name="lucide:chevron-right"
					class="size-4 shrink-0 text-neutral-300 dark:text-neutral-600"
				/>
			</NuxtLink>
		</div>
	</div>
</template>
