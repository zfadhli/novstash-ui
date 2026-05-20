<script setup lang="ts">
definePageMeta({ middleware: "admin-auth", layout: "admin" });

const router = useRouter();
const route = useRoute();
const toast = useToast();

const slug = ref(route.params.slug as string);
const title = ref("");
const author = ref("");
const status = ref("");
const genres = ref("");
const description = ref("");
const coverUrl = ref("");
const chapterCount = ref<number | null>(null);
const loading = ref(true);
const submitting = ref(false);

// Fetch current novel data
onMounted(async () => {
	try {
		const novel = await $fetch(`/api/novels/${slug.value}`);
		title.value = novel.title ?? "";
		author.value = novel.author ?? "";
		status.value = novel.status ?? "";
		genres.value = novel.genres ?? "";
		description.value = novel.description ?? "";
		coverUrl.value = novel.coverUrl ?? "";
		chapterCount.value = novel.chapterCount ?? null;
	} catch (err) {
		toast.add({
			title: "Failed to load novel",
			color: "error",
			description: String(err),
		});
	} finally {
		loading.value = false;
	}
});

async function handleSubmit() {
	if (!title.value) {
		toast.add({ title: "Title is required", color: "warning" });
		return;
	}

	submitting.value = true;
	try {
		await $fetch(`/api/admin/novels/${slug.value}`, {
			method: "PUT",
			body: {
				title: title.value,
				author: author.value || null,
				status: status.value || null,
				genres: genres.value || null,
				description: description.value || null,
				coverUrl: coverUrl.value || null,
				chapterCount: chapterCount.value,
			},
		});
		toast.add({ title: "Novel updated", color: "success" });
		router.push("/admin/novels");
	} catch (err) {
		toast.add({
			title: "Failed to update novel",
			color: "error",
			description: String(err),
		});
	} finally {
		submitting.value = false;
	}
}
</script>

<template>
	<div>
		<div class="mb-6">
			<UButton to="/admin/novels" variant="ghost" size="sm" icon="lucide:arrow-left">
				Back to novels
			</UButton>
		</div>

		<h1 class="mb-6 font-serif text-2xl font-bold">Edit Novel: {{ slug }}</h1>

		<UCard v-if="loading">
			<div class="flex items-center justify-center py-12">
				<UIcon name="lucide:loader-circle" class="size-6 animate-spin text-neutral-400" />
			</div>
		</UCard>

		<UForm v-else :state="{ title }" class="max-w-lg space-y-4" @submit="handleSubmit">
			<UFormField label="Title" required>
				<UInput v-model="title" class="w-full" />
			</UFormField>

			<UFormField label="Author">
				<UInput v-model="author" class="w-full" />
			</UFormField>

			<UFormField label="Status">
				<USelect
					v-model="status"
					:items="[
						{ label: 'Ongoing', value: 'ongoing' },
						{ label: 'Completed', value: 'completed' },
						{ label: 'Hiatus', value: 'hiatus' },
						{ label: 'Dropped', value: 'dropped' },
					]"
					class="w-full"
				/>
			</UFormField>

			<UFormField label="Genres (comma-separated)">
				<UInput v-model="genres" class="w-full" />
			</UFormField>

			<UFormField label="Description">
				<UTextarea v-model="description" class="w-full" />
			</UFormField>

			<UFormField label="Cover URL">
				<UInput v-model="coverUrl" class="w-full" />
			</UFormField>

			<UFormField label="Chapter Count">
				<UInput v-model.number="chapterCount" type="number" class="w-full" />
			</UFormField>

			<div class="flex gap-3 pt-2">
				<UButton type="submit" :loading="submitting" icon="lucide:save">
					Save Changes
				</UButton>
				<UButton to="/admin/novels" variant="outline">
					Cancel
				</UButton>
			</div>
		</UForm>
	</div>
</template>
