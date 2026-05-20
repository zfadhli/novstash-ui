<script setup lang="ts">
definePageMeta({ middleware: "admin-auth", layout: "admin" });

const router = useRouter();
const toast = useToast();

const slug = ref("");
const title = ref("");
const author = ref("");
const status = ref("");
const genres = ref("");
const description = ref("");
const coverUrl = ref("");
const chapterCount = ref<number | null>(null);
const submitting = ref(false);

async function handleSubmit() {
	if (!slug.value || !title.value) {
		toast.add({ title: "Slug and title are required", color: "warning" });
		return;
	}

	submitting.value = true;
	try {
		await $fetch("/api/admin/novels", {
			method: "POST",
			body: {
				slug: slug.value,
				title: title.value,
				author: author.value || null,
				status: status.value || null,
				genres: genres.value || null,
				description: description.value || null,
				coverUrl: coverUrl.value || null,
				chapterCount: chapterCount.value,
			},
		});
		toast.add({ title: "Novel created", color: "success" });
		router.push("/admin/novels");
	} catch (err) {
		toast.add({
			title: "Failed to create novel",
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

		<h1 class="mb-6 font-serif text-2xl font-bold">Add Novel</h1>

		<UForm :state="{ slug, title }" class="max-w-lg space-y-4" @submit="handleSubmit">
			<UFormField label="Slug" required>
				<UInput v-model="slug" placeholder="my-novel-slug" class="w-full" />
			</UFormField>

			<UFormField label="Title" required>
				<UInput v-model="title" placeholder="My Novel" class="w-full" />
			</UFormField>

			<UFormField label="Author">
				<UInput v-model="author" placeholder="Author Name" class="w-full" />
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
				<UInput v-model="genres" placeholder="Fantasy, Action, Romance" class="w-full" />
			</UFormField>

			<UFormField label="Description">
				<UTextarea v-model="description" placeholder="Novel description..." class="w-full" />
			</UFormField>

			<UFormField label="Cover URL">
				<UInput v-model="coverUrl" placeholder="https://..." class="w-full" />
			</UFormField>

			<UFormField label="Chapter Count">
				<UInput v-model.number="chapterCount" type="number" placeholder="0" class="w-full" />
			</UFormField>

			<div class="flex gap-3 pt-2">
				<UButton type="submit" :loading="submitting" icon="lucide:save">
					Create Novel
				</UButton>
				<UButton to="/admin/novels" variant="outline">
					Cancel
				</UButton>
			</div>
		</UForm>
	</div>
</template>
