<script setup lang="ts">
definePageMeta({ middleware: "admin-auth", layout: "admin", ssr: false });

const { novels, total, pending, error, refresh } = useAdminNovels();
const toast = useToast();

// ── Import slideover state ────────────────────────────────────────

const showImportSlideover = ref(false);
const importUrl = ref("");
const scraping = ref(false);
const scrapeResult = ref<{
	success: boolean;
	slug?: string;
	title?: string;
	author?: string | null;
	chapter_count?: number;
	error?: string;
	message?: string;
} | null>(null);

const urlValid = computed(() => {
	if (!importUrl.value) return false;
	try {
		new URL(importUrl.value);
		return true;
	} catch {
		return false;
	}
});

async function handleScrape() {
	if (!urlValid.value) return;

	scraping.value = true;
	scrapeResult.value = null;

	try {
		const result = await $fetch<ScrapeResult>("/api/admin/novels/scrape", {
			method: "POST",
			body: { url: importUrl.value },
		});
		scrapeResult.value = result;

		if (result.success) {
			toast.add({
				title: `"${result.title}" imported`,
				description: `${result.chapter_count} chapters scraped`,
				color: "success",
			});
			// Close slideover and refresh after a brief delay
			setTimeout(() => {
				showImportSlideover.value = false;
				importUrl.value = "";
				scrapeResult.value = null;
				refresh();
			}, 1500);
		}
	} catch (err: unknown) {
		const msg =
			err instanceof Error
				? err.message
				: typeof err === "string"
					? err
					: "Scrape failed";
		scrapeResult.value = {
			success: false,
			error: msg,
		};
	}

	scraping.value = false;
}

function resetImport() {
	importUrl.value = "";
	scrapeResult.value = null;
	showImportSlideover.value = false;
}

// ── Delete ────────────────────────────────────────────────────────

async function handleDelete(slug: string) {
	const confirmed = confirm(
		"Are you sure you want to delete this novel? This action cannot be undone.",
	);
	if (!confirmed) return;

	try {
		await $fetch(`/api/admin/novels/${slug}`, { method: "DELETE" });
		toast.add({ title: "Novel deleted", color: "success" });
		refresh();
	} catch (err) {
		toast.add({
			title: "Failed to delete novel",
			color: "error",
			description: String(err),
		});
	}
}
</script>

<template>
	<div>
		<div class="mb-6 flex items-center justify-between">
			<h1 class="font-serif text-2xl font-bold">Novels</h1>
			<div class="flex items-center gap-2">
				<UButton
					variant="outline"
					icon="lucide:download"
					@click="showImportSlideover = true"
				>
					Import from URL
				</UButton>
				<UButton to="/admin/novels/create" icon="lucide:plus">
					Add Novel
				</UButton>
			</div>
		</div>

		<UCard v-if="pending">
			<div class="flex items-center justify-center py-12">
				<UIcon name="lucide:loader-circle" class="size-6 animate-spin text-neutral-400" />
			</div>
		</UCard>

		<UCard v-else-if="error">
			<div class="flex flex-col items-center gap-2 py-8 text-center">
				<Icon name="lucide:alert-circle" class="size-8 text-red-500" />
				<p class="text-sm font-medium">Failed to load novels</p>
				<p class="text-xs text-neutral-500">{{ error.message }}</p>
				<UButton size="sm" variant="outline" @click="refresh()">Retry</UButton>
			</div>
		</UCard>

		<UTable
			v-else-if="novels.length > 0"
			:data="novels"
			:columns="[
				{ accessorKey: 'title', header: 'Title' },
				{ accessorKey: 'author', header: 'Author' },
				{ accessorKey: 'status', header: 'Status' },
				{ accessorKey: 'chapterCount', header: 'Chapters' },
				{ accessorKey: 'actions', header: '' },
			]"
		>
			<template #title-cell="{ row }">
				<div class="flex items-center gap-3">
					<img
						v-if="row.coverUrl"
						:src="row.coverUrl"
						:alt="row.title"
						class="size-10 rounded object-cover"
					/>
					<div class="font-medium">{{ row.title }}</div>
				</div>
			</template>

			<template #actions-cell="{ row }">
				<div class="flex items-center gap-1">
					<UButton
						:to="`/admin/novels/${row.slug}/edit`"
						variant="ghost"
						size="sm"
						icon="lucide:pencil"
						title="Edit"
					/>
					<UButton
						:to="`/admin/novels/${row.slug}/chapters`"
						variant="ghost"
						size="sm"
						icon="lucide:list"
						title="Chapters"
					/>
					<UButton
						variant="ghost"
						size="sm"
						icon="lucide:trash-2"
						color="error"
						title="Delete"
						@click="handleDelete(row.slug)"
					/>
				</div>
			</template>
		</UTable>

		<UCard v-else>
			<div class="flex flex-col items-center gap-2 py-8 text-center">
				<Icon name="lucide:book-open" class="size-8 text-neutral-400" />
				<p class="text-sm text-neutral-500">No novels found</p>
				<UButton to="/admin/novels/create" size="sm" icon="lucide:plus">
					Add your first novel
				</UButton>
			</div>
		</UCard>

		<div class="mt-4 text-sm text-neutral-500">
			Total: {{ total }} novels
		</div>
	</div>

	<!-- ── Import Novel Slideover ─────────────────────────────── -->

	<USlideover
		:open="showImportSlideover"
		title="Import Novel from URL"
		@close="resetImport()"
	>
		<template #body>
			<div class="flex flex-col gap-4 p-4">
				<!-- URL input -->
				<div>
					<UInput
						v-model="importUrl"
						placeholder="https://freewebnovel.com/novel/..."
						size="lg"
						:disabled="scraping"
						@keydown.enter="handleScrape"
					/>
					<p class="mt-1 text-xs text-neutral-500">
						Paste the full URL of a novel's info page from a supported site.
					</p>
				</div>

				<!-- Scrape button -->
				<UButton
					size="lg"
					:disabled="!urlValid || scraping"
					:loading="scraping"
					@click="handleScrape"
				>
					{{ scraping ? "Scraping..." : "Scrape" }}
				</UButton>

				<!-- Loading state -->
				<div
					v-if="scraping"
					class="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800"
				>
					<UIcon
						name="lucide:loader-circle"
						class="size-5 animate-spin text-primary-500"
					/>
					<div>
						<p class="text-sm font-medium">Scraping novel...</p>
						<p class="text-xs text-neutral-500">
							This may take a few minutes depending on the number of chapters.
						</p>
					</div>
				</div>

				<!-- Error state -->
				<div
					v-else-if="scrapeResult && !scrapeResult.success"
					class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/20"
				>
					<div class="flex items-start gap-3">
						<UIcon
							name="lucide:alert-circle"
							class="mt-0.5 size-5 shrink-0 text-red-500"
						/>
						<div class="min-w-0">
							<p class="text-sm font-medium text-red-800 dark:text-red-200">
								Scrape failed
							</p>
							<p class="mt-1 text-xs text-red-600 dark:text-red-400">
								{{ scrapeResult.error }}
							</p>
							<UButton
								size="xs"
								variant="outline"
								color="error"
								class="mt-3"
								@click="handleScrape"
							>
								Retry
							</UButton>
						</div>
					</div>
				</div>

				<!-- Success state -->
				<div
					v-else-if="scrapeResult && scrapeResult.success"
					class="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900/20"
				>
					<div class="flex items-start gap-3">
						<UIcon
							name="lucide:check-circle"
							class="mt-0.5 size-5 shrink-0 text-green-500"
						/>
						<div class="min-w-0">
							<p class="text-sm font-medium text-green-800 dark:text-green-200">
								Imported successfully
							</p>
							<ul class="mt-2 space-y-1 text-xs text-green-700 dark:text-green-300">
								<li>
									<span class="font-medium">Title:</span>
									{{ scrapeResult.title }}
								</li>
								<li v-if="scrapeResult.author">
									<span class="font-medium">Author:</span>
									{{ scrapeResult.author }}
								</li>
								<li>
									<span class="font-medium">Chapters:</span>
									{{ scrapeResult.chapter_count }}
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</template>

		<template #footer>
			<div class="flex justify-end p-4">
				<UButton
					v-if="scrapeResult?.success"
					size="lg"
					color="success"
					@click="resetImport()"
				>
					Close
				</UButton>
				<UButton
					v-else
					variant="ghost"
					@click="resetImport()"
				>
					Cancel
				</UButton>
			</div>
		</template>
	</USlideover>
</template>
