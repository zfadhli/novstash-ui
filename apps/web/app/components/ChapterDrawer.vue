<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import { useChapterList } from "~/composables/useChapterList";
import type { Chapter } from "~/types/novel";

const props = defineProps<{
	novelSlug: string;
	currentChapterIdx: number;
}>();

const emit = defineEmits<(e: "close") => void>();

const open = defineModel<boolean>("open", { required: true });

const { chapters, pending } = useChapterList(props.novelSlug);

const listContainer = ref<HTMLElement | null>(null);
const activeChapterId = ref<number | null>(null);

// Track the active chapter element for auto-scrolling using a callback ref
function setActiveRef(el: Element | null) {
	if (el && activeChapterId.value === null) {
		activeChapterId.value = props.currentChapterIdx;
		requestAnimationFrame(() => {
			el.scrollIntoView({ behavior: "smooth", block: "center" });
		});
	}
}

// Auto-scroll to the active chapter when the slideover opens
watch(open, async (isOpen) => {
	if (isOpen && chapters.value.length > 0) {
		activeChapterId.value = null;
		await nextTick();
		// Wait for the DOM to render
		setTimeout(() => {
			const activeEl = document.querySelector("[data-active-chapter]");
			if (activeEl) {
				activeEl.scrollIntoView({ behavior: "smooth", block: "center" });
			}
		}, 350);
	}
});

function isActive(chapter: Chapter) {
	return chapter.idx === props.currentChapterIdx;
}

function handleNavigate(chapter: Chapter) {
	if (isActive(chapter)) {
		emit("close");
		open.value = false;
	}
}
</script>

<template>
	<USlideover
		v-model:open="open"
		:title="`Chapters`"
		:description="`${chapters.length} chapters`"
		:side="'right'"
		@close:prevent="emit('close')"
	>
		<template #body>
			<div
				ref="listContainer"
				class="divide-y divide-neutral-100 overflow-y-auto dark:divide-neutral-800"
				style="max-height: calc(100vh - 8rem)"
			>
				<!-- Loading skeleton -->
				<div
					v-if="pending"
					class="space-y-1 px-1 py-4"
				>
					<div
						v-for="i in 12"
						:key="i"
						class="h-11 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800"
					/>
				</div>

				<!-- Chapter items -->
				<NuxtLink
					v-for="chapter in chapters"
					:key="chapter.id"
					:ref="(el: Element | null) => { if (el && isActive(chapter)) setActiveRef(el) }"
					:data-active-chapter="isActive(chapter) ? true : undefined"
					:to="isActive(chapter) ? undefined : `/read/${novelSlug}/${chapter.idx}`"
					:class="[
						'group flex items-center gap-3 px-4 py-2.5 transition-all duration-150',
						isActive(chapter)
							? 'bg-emerald-50/80 dark:bg-emerald-950/30'
							: 'hover:bg-neutral-50 dark:hover:bg-neutral-800/40',
					]"
					@click="handleNavigate(chapter)"
				>
					<!-- Chapter number badge -->
					<span
						:class="[
							'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all duration-150',
							isActive(chapter)
								? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30'
								: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700',
						]"
					>
						{{ chapter.idx }}
					</span>

					<!-- Chapter title and meta -->
					<div class="min-w-0 flex-1">
						<p
							:class="[
								'truncate text-sm transition-colors duration-150',
								isActive(chapter)
									? 'font-semibold text-emerald-700 dark:text-emerald-400'
									: 'font-medium text-neutral-800 dark:text-neutral-200',
							]"
						>
							{{ chapter.title || `Chapter ${chapter.idx}` }}
						</p>
						<p
							v-if="chapter.createdAt"
							class="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500"
						>
							{{ new Date(chapter.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) }}
						</p>
					</div>

					<!-- Active indicator -->
					<div
						v-if="isActive(chapter)"
						class="flex shrink-0 items-center"
					>
						<Icon
							name="lucide:book-open"
							class="size-4 text-emerald-500"
						/>
					</div>
				</NuxtLink>
			</div>
		</template>
	</USlideover>
</template>

<style scoped>
/* Subtle custom scrollbar for the list */
[style*="max-height"]::-webkit-scrollbar {
	width: 4px;
}

[style*="max-height"]::-webkit-scrollbar-track {
	background: transparent;
}

[style*="max-height"]::-webkit-scrollbar-thumb {
	background: rgb(0 0 0 / 0.1);
	border-radius: 999px;
}

[style*="max-height"]::-webkit-scrollbar-thumb:hover {
	background: rgb(0 0 0 / 0.2);
}
</style>
