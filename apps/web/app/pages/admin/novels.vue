<script setup lang="ts">
definePageMeta({ middleware: "admin-auth", layout: "admin", ssr: false });

const { novels, total, pending, error, refresh } = useAdminNovels();
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
			:rows="novels"
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
</template>
