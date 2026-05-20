<script setup lang="ts">
definePageMeta({ middleware: "admin-auth", layout: "admin" });

const route = useRoute();
const toast = useToast();

const slug = route.params.slug as string;
const chapters = ref<
	Array<{ id: number; idx: number; title: string; url: string | null }>
>([]);
const loading = ref(true);

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

async function handleDelete(idx: number) {
	const confirmed = confirm("Delete this chapter?");
	if (!confirmed) return;

	try {
		await $fetch(`/api/admin/novels/${slug}/chapters/${idx}`, {
			method: "DELETE",
		});
		toast.add({ title: "Chapter deleted", color: "success" });
		fetchChapters();
	} catch (err) {
		toast.add({
			title: "Failed to delete chapter",
			color: "error",
			description: String(err),
		});
	}
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
					v-if="row.url"
					:href="row.url"
					target="_blank"
					rel="noopener noreferrer"
					class="text-sm text-blue-500 hover:underline"
				>
					{{ row.url.length > 50 ? row.url.slice(0, 50) + "…" : row.url }}
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
					@click="handleDelete(row.idx)"
				/>
			</template>
		</UTable>
	</div>
</template>
