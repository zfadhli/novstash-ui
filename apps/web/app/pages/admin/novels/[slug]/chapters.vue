<script setup lang="ts">
definePageMeta({ middleware: "admin-auth", layout: "admin" });

const route = useRoute();
const toast = useToast();

const slug = route.params.slug as string;
const chapters = ref<
	Array<{ id: number; idx: number; title: string; url: string | null }>
>([]);
const loading = ref(true);

const deleteModalOpen = ref(false);
const deletingIdx = ref<number | null>(null);
const deleting = ref(false);

async function fetchChapters() {
	loading.value = true;
	try {
		const data = await $fetch(`/api/admin/novels/${slug}/chapters`);
		chapters.value = data.items ?? data;
	} catch (err) {
		toast.add({
			title: "Failed to load chapters",
			color: "error",
			description: String(err),
		});
	} finally {
		loading.value = false;
	}
}

onMounted(fetchChapters);

function promptDelete(idx: number) {
	deletingIdx.value = idx;
	deleteModalOpen.value = true;
}

async function confirmDelete() {
	if (deletingIdx.value === null) return;

	deleting.value = true;
	try {
		await $fetch(`/api/admin/novels/${slug}/chapters/${deletingIdx.value}`, {
			method: "DELETE",
		});
		toast.add({ title: "Chapter deleted", color: "success" });
		deleteModalOpen.value = false;
		deletingIdx.value = null;
		fetchChapters();
	} catch (err) {
		toast.add({
			title: "Failed to delete chapter",
			color: "error",
			description: String(err),
		});
	} finally {
		deleting.value = false;
	}
}

function cancelDelete() {
	deleteModalOpen.value = false;
	deletingIdx.value = null;
}
</script>

<template>
	<div>
		<div class="mb-6 flex items-center justify-between">
			<div>
				<UButton to="/admin/novels" variant="ghost" size="sm" icon="lucide:arrow-left">
					Back to novels
				</UButton>
				<h1 class="mt-2 font-serif text-2xl font-bold">Chapters: {{ slug }}</h1>
			</div>
		</div>

		<UCard v-if="loading">
			<div class="flex items-center justify-center py-12">
				<UIcon name="lucide:loader-circle" class="size-6 animate-spin text-neutral-400" />
			</div>
		</UCard>

		<UTable
			v-else
			:data="chapters"
			:columns="[
				{ accessorKey: 'idx', header: '#' },
				{ accessorKey: 'title', header: 'Title' },
				{ accessorKey: 'url', header: 'URL' },
				{ accessorKey: 'actions', header: '' },
			]"
		>
			<template #url-cell="{ row }">
				<a
					v-if="row.original.url"
					:href="row.original.url"
					target="_blank"
					rel="noopener noreferrer"
					class="text-sm text-blue-500 hover:underline"
				>
					{{ row.original.url.length > 50 ? row.original.url.slice(0, 50) + "…" : row.original.url }}
				</a>
				<span v-else class="text-sm text-neutral-400">—</span>
			</template>

			<template #actions-cell="{ row }">
				<UButton
					variant="ghost"
					size="sm"
					icon="lucide:trash-2"
					color="error"
					title="Delete"
					@click="promptDelete(row.original.idx)"
				/>
			</template>
		</UTable>
	</div>

	<!-- ── Delete Confirmation Modal ─────────────────────────── -->

	<UModal :open="deleteModalOpen" title="Delete Chapter" @close="cancelDelete()">
		<template #body>
			<div class="p-4">
				<p class="text-sm text-neutral-600 dark:text-neutral-400">
					Are you sure you want to delete this chapter? This action cannot be undone.
				</p>
			</div>
		</template>
		<template #footer>
			<div class="flex justify-end gap-2 p-4">
				<UButton variant="outline" @click="cancelDelete()" :disabled="deleting">
					Cancel
				</UButton>
				<UButton color="error" :loading="deleting" @click="confirmDelete()">
					Delete
				</UButton>
			</div>
		</template>
	</UModal>
</template>
