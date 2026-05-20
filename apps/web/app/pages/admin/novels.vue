<script setup lang="ts">
definePageMeta({ middleware: "admin-auth", layout: "admin" });

const { novels, total, page, pending, refresh } = useAdminNovels();
const toast = useToast();

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
			<UButton to="/admin/novels/create" icon="lucide:plus">
				Add Novel
			</UButton>
		</div>

		<UCard v-if="pending">
			<div class="flex items-center justify-center py-12">
				<UIcon name="lucide:loader-circle" class="size-6 animate-spin text-neutral-400" />
			</div>
		</UCard>

		<UTable
			v-else
			:rows="novels"
			:columns="[
				{ key: 'title', label: 'Title' },
				{ key: 'author', label: 'Author' },
				{ key: 'status', label: 'Status' },
				{ key: 'chapterCount', label: 'Chapters' },
				{ key: 'actions', label: '' },
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

		<div class="mt-4 text-sm text-neutral-500">
			Total: {{ total }} novels
		</div>
	</div>
</template>
