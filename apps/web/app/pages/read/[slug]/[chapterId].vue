<script setup lang="ts">
definePageMeta({
	title: "Reading - Novstash",
});

const route = useRoute();
const novelId = route.params.slug as string;
const chapterIdx = Number(route.params.chapterId);

const { chapter, pending, error } = useChapter(novelId, chapterIdx);
const { settings, setFontSize, setFontFamily, setTheme, setLineHeight } =
	useReaderSettings();
const { saveProgress } = useReadingHistory();
const { saveProgress: saveLocalProgress } = useReadingProgress();
const { render: renderMd } = useMarkdown();
const { prefetched } = useChapterPrefetch(novelId, chapterIdx);

const renderedContent = computed(() =>
	renderMd(chapter.value?.contentMd ?? ""),
);

const showSettings = ref(false);
const showChapterDrawer = ref(false);
const showShortcutsModal = ref(false);

// 👇 Save reading progress whenever a chapter successfully loads
watch(
	chapter,
	async (c) => {
		if (c) {
			try {
				await saveProgress(c.novelSlug, c.idx, c.title ?? undefined);
			} catch (e) {
				console.error("Failed to save reading progress:", e);
			}
		}
	},
	{ immediate: true },
);

// ---- C1e: Reading progress bar ----
const scrollProgress = ref(0);

function onScroll() {
	const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
	scrollProgress.value = maxScroll > 0 ? window.scrollY / maxScroll : 0;
}

const progressBarVisible = computed(() => scrollProgress.value > 0.005);

// ---- C1c: Fullscreen toggle ----
function toggleFullscreen() {
	if (document.fullscreenElement) {
		document.exitFullscreen();
	} else {
		document.documentElement.requestFullscreen();
	}
}

// ---- C1c: Theme cycling ----
const themeCycle: Array<"sepia" | "light" | "dark"> = [
	"sepia",
	"light",
	"dark",
];

function cycleTheme() {
	const current = settings.value.theme;
	const idx = themeCycle.indexOf(current);
	const next = themeCycle[(idx + 1) % themeCycle.length];
	setTheme(next);
}

// ---- Keyboard navigation ----
function onKeydown(e: KeyboardEvent) {
	if (!chapter.value) return;

	switch (e.key) {
		case "ArrowLeft":
			if (chapter.value.prevChapter) {
				navigateTo(`/read/${novelId}/${chapter.value.prevChapter.idx}`);
			}
			break;
		case "ArrowRight":
			if (chapter.value.nextChapter) {
				navigateTo(`/read/${novelId}/${chapter.value.nextChapter.idx}`);
			}
			break;
		case "s":
			showSettings.value = !showSettings.value;
			break;
		case "c":
			showChapterDrawer.value = !showChapterDrawer.value;
			break;
		case "t":
			cycleTheme();
			break;
		case "?":
			showShortcutsModal.value = !showShortcutsModal.value;
			break;
		case "f":
			toggleFullscreen();
			break;
	}
}

onMounted(() => {
	window.addEventListener("keydown", onKeydown);
	window.addEventListener("scroll", onScroll, { passive: true });
});

onUnmounted(() => {
	window.removeEventListener("keydown", onKeydown);
	window.removeEventListener("scroll", onScroll);
});

// Save scroll position to localStorage on unmount for 'Continue Reading' on novel page
onUnmounted(() => {
	if (chapter.value) {
		saveLocalProgress(
			chapter.value.novelSlug,
			chapter.value.idx,
			chapter.value.title ?? undefined,
			window.scrollY,
		);
	}
});

// Theme classes for the reader
const readerThemeClass = computed(() => {
	switch (settings.value.theme) {
		case "dark":
			return "bg-neutral-900 text-neutral-300";
		case "light":
			return "bg-white text-neutral-900";
		default:
			return "bg-amber-50 text-neutral-800";
	}
});

const fontFamilyClass = computed(() => {
	switch (settings.value.fontFamily) {
		case "sans":
			return "font-sans";
		case "mono":
			return "font-mono";
		default:
			return "font-serif";
	}
});
</script>

<template>
	<div>
		<!-- Loading -->
		<div
			v-if="pending"
			class="flex items-center justify-center py-32"
		>
			<Icon
				name="lucide:loader-circle"
				class="size-8 animate-spin text-neutral-300 dark:text-neutral-600"
			/>
		</div>

		<!-- Error -->
		<div
			v-else-if="error"
			class="flex flex-col items-center justify-center py-20 text-neutral-400 dark:text-neutral-500"
		>
			<Icon name="lucide:alert-circle" class="mb-4 size-12" />
			<p class="text-lg font-medium">Chapter not found</p>
			<UButton
				:to="`/novels/${novelId}`"
				variant="soft"
				class="mt-4"
			>
				Back to novel
			</UButton>
		</div>

		<!-- Reader -->
		<template v-else-if="chapter">
			<!-- Reader header bar -->
			<div class="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/80">
				<div class="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
					<div class="flex items-center gap-3">
						<UButton
							:to="`/novels/${novelId}`"
							variant="ghost"
							size="sm"
							icon="lucide:arrow-left"
						/>
						<div class="hidden sm:block">
							<p class="text-xs text-neutral-500 dark:text-neutral-400">
								Chapter {{ chapter.idx }}
							</p>
							<p class="text-sm font-medium leading-tight text-neutral-900 dark:text-neutral-300 line-clamp-1">
								{{ chapter.title || `Chapter ${chapter.idx}` }}
							</p>
						</div>
					</div>

					<div class="flex items-center gap-1">
						<UButton
							variant="ghost"
							size="sm"
							:disabled="!chapter.prevChapter"
							:to="chapter.prevChapter ? `/read/${novelId}/${chapter.prevChapter.idx}` : undefined"
							icon="lucide:chevron-left"
						/>
						<UButton
							variant="ghost"
							size="sm"
							@click="showChapterDrawer = true"
							title="Chapters"
						>
							<Icon name="lucide:list" class="size-4" />
						</UButton>
						<UButton
							variant="ghost"
							size="sm"
							@click="showSettings = !showSettings"
							title="Settings"
						>
							<Icon name="lucide:type" class="size-4" />
						</UButton>
						<!-- C1c: Help button -->
						<UButton
							variant="ghost"
							size="sm"
							@click="showShortcutsModal = true"
							title="Keyboard shortcuts"
						>
							<Icon name="lucide:circle-help" class="size-4" />
						</UButton>
						<UButton
							variant="ghost"
							size="sm"
							:disabled="!chapter.nextChapter"
							:to="chapter.nextChapter ? `/read/${novelId}/${chapter.nextChapter.idx}` : undefined"
							icon="lucide:chevron-right"
						/>
					</div>
				</div>

				<!-- Reader settings panel -->
				<div
					v-if="showSettings"
					class="border-t border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900"
				>
					<div class="mx-auto flex max-w-4xl flex-wrap items-center gap-6">
						<!-- Font size -->
						<div class="flex items-center gap-2">
							<span class="text-xs font-medium text-neutral-500 dark:text-neutral-400">Size</span>
							<div class="flex items-center gap-1">
								<UButton
									variant="ghost"
									size="xs"
									icon="lucide:minus"
									@click="setFontSize(settings.fontSize - 1)"
								/>
								<span class="w-8 text-center text-xs tabular-nums text-neutral-700 dark:text-neutral-300">
									{{ settings.fontSize }}
								</span>
								<UButton
									variant="ghost"
									size="xs"
									icon="lucide:plus"
									@click="setFontSize(settings.fontSize + 1)"
								/>
							</div>
						</div>

						<!-- C1b: Font size presets -->
						<div class="flex items-center gap-2">
							<span class="text-xs font-medium text-neutral-500 dark:text-neutral-400">Presets</span>
							<div class="flex gap-1">
								<UButton
									:variant="settings.fontSize === 14 ? 'solid' : 'ghost'"
									size="xs"
									@click="setFontSize(14)"
								>
									Small
								</UButton>
								<UButton
									:variant="settings.fontSize === 18 ? 'solid' : 'ghost'"
									size="xs"
									@click="setFontSize(18)"
								>
									Medium
								</UButton>
								<UButton
									:variant="settings.fontSize === 22 ? 'solid' : 'ghost'"
									size="xs"
									@click="setFontSize(22)"
								>
									Large
								</UButton>
								<UButton
									:variant="settings.fontSize === 26 ? 'solid' : 'ghost'"
									size="xs"
									@click="setFontSize(26)"
								>
									XL
								</UButton>
							</div>
						</div>

						<!-- Line height -->
						<div class="flex items-center gap-2">
							<span class="text-xs font-medium text-neutral-500 dark:text-neutral-400">Spacing</span>
							<div class="flex items-center gap-1">
								<UButton
									variant="ghost"
									size="xs"
									icon="lucide:minus"
									@click="setLineHeight(settings.lineHeight - 0.2)"
								/>
								<span class="w-8 text-center text-xs tabular-nums text-neutral-700 dark:text-neutral-300">
									{{ settings.lineHeight.toFixed(1) }}
								</span>
								<UButton
									variant="ghost"
									size="xs"
									icon="lucide:plus"
									@click="setLineHeight(settings.lineHeight + 0.2)"
								/>
							</div>
						</div>

						<!-- Font family -->
						<div class="flex items-center gap-2">
							<span class="text-xs font-medium text-neutral-500 dark:text-neutral-400">Font</span>
							<div class="flex gap-1">
								<UButton
									:variant="settings.fontFamily === 'serif' ? 'solid' : 'ghost'"
									size="xs"
									@click="setFontFamily('serif')"
								>
									Serif
								</UButton>
								<UButton
									:variant="settings.fontFamily === 'sans' ? 'solid' : 'ghost'"
									size="xs"
									@click="setFontFamily('sans')"
								>
									Sans
								</UButton>
								<UButton
									:variant="settings.fontFamily === 'mono' ? 'solid' : 'ghost'"
									size="xs"
									@click="setFontFamily('mono')"
								>
									Mono
								</UButton>
							</div>
						</div>

						<!-- Theme -->
						<div class="flex items-center gap-2">
							<span class="text-xs font-medium text-neutral-500 dark:text-neutral-400">Theme</span>
							<div class="flex gap-1">
								<UButton
									:variant="settings.theme === 'sepia' ? 'solid' : 'ghost'"
									size="xs"
									@click="setTheme('sepia')"
								>
									Sepia
								</UButton>
								<UButton
									:variant="settings.theme === 'light' ? 'solid' : 'ghost'"
									size="xs"
									@click="setTheme('light')"
								>
									Light
								</UButton>
								<UButton
									:variant="settings.theme === 'dark' ? 'solid' : 'ghost'"
									size="xs"
									@click="setTheme('dark')"
								>
									Dark
								</UButton>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Reader content -->
			<div
				:class="[readerThemeClass, fontFamilyClass]"
				class="min-h-[calc(100vh-3.5rem)] transition-colors duration-200"
			>
				<!-- C1e: Reading progress bar -->
				<div
					class="pointer-events-none fixed right-0 left-0 top-14 z-30 mx-auto max-w-4xl transition-opacity duration-300"
					:class="progressBarVisible ? 'opacity-100' : 'opacity-0'"
				>
					<div
						class="h-[3px] rounded-r-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-150"
						:style="{ width: `${scrollProgress * 100}%` }"
					/>
				</div>

				<article
					class="mx-auto px-4 py-12"
					:style="{
						maxWidth: `${settings.maxWidth}px`,
						fontSize: `${settings.fontSize}px`,
						lineHeight: settings.lineHeight,
					}"
				>
					<!-- Chapter heading -->
					<header class="mb-10 text-center">
						<p class="mb-2 text-sm uppercase tracking-widest opacity-50">
							Chapter {{ chapter.idx }}
						</p>
						<h1
							v-if="chapter.title"
							class="text-3xl font-bold"
						>
							{{ chapter.title }}
						</h1>
					</header>

					<!-- Chapter content -->
					<div
						class="prose-custom"
						v-html="renderedContent"
					/>

					<!-- Chapter navigation footer -->
					<nav class="mt-16 flex items-center justify-between border-t border-current/10 pt-8">
						<UButton
							v-if="chapter.prevChapter"
							:to="`/read/${novelId}/${chapter.prevChapter.idx}`"
							variant="ghost"
							class="flex-col items-start"
						>
							<span class="text-xs opacity-60">Previous</span>
							<span class="text-sm font-medium">{{ chapter.prevChapter.title || `Chapter ${chapter.prevChapter.idx}` }}</span>
						</UButton>
						<div v-else />

						<UButton
							v-if="chapter.nextChapter"
							:to="`/read/${novelId}/${chapter.nextChapter.idx}`"
							variant="ghost"
							class="flex-col items-end"
						>
							<span class="text-xs opacity-60">Next</span>
							<span class="text-sm font-medium">{{ chapter.nextChapter.title || `Chapter ${chapter.nextChapter.idx}` }}</span>
						</UButton>
						<div v-else />
					</nav>
				</article>
			</div>
		</template>

		<!-- Chapter Drawer -->
		<ChapterDrawer
			v-if="chapter"
			v-model:open="showChapterDrawer"
			:novel-slug="novelId"
			:current-chapter-idx="chapter.idx"
		/>

		<!-- C1c: Keyboard Shortcuts Modal -->
		<KeyboardShortcutsModal v-model:open="showShortcutsModal" />
	</div>
</template>

