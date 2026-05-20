<script setup lang="ts">
definePageMeta({ middleware: "admin-auth", layout: "admin" });

const users = ref<
	Array<{
		id: string;
		email: string;
		name: string | null;
		avatar: string | null;
		role: string;
		createdAt: string | null;
	}>
>([]);
const loading = ref(true);

onMounted(async () => {
	try {
		const data = await $fetch("/api/admin/users");
		users.value = data.items ?? data;
	} catch (err) {
		console.error("Failed to load users:", err);
	} finally {
		loading.value = false;
	}
});
</script>

<template>
	<div>
		<h1 class="mb-6 font-serif text-2xl font-bold">Users</h1>

		<UCard v-if="loading">
			<div class="flex items-center justify-center py-12">
				<UIcon name="lucide:loader-circle" class="size-6 animate-spin text-neutral-400" />
			</div>
		</UCard>

		<UTable
			v-else
			:rows="users"
			:columns="[
				{ key: 'name', label: 'Name' },
				{ key: 'email', label: 'Email' },
				{ key: 'role', label: 'Role' },
				{ key: 'createdAt', label: 'Joined' },
			]"
		>
			<template #name-cell="{ row }">
				<div class="flex items-center gap-2">
					<UAvatar
						:src="row.avatar || undefined"
						:text="row.name?.charAt(0)?.toUpperCase() || '?'"
						size="sm"
					/>
					<span>{{ row.name || "Unknown" }}</span>
				</div>
			</template>

			<template #role-cell="{ row }">
				<UBadge :color="row.role === 'admin' ? 'amber' : 'neutral'" variant="soft">
					{{ row.role }}
				</UBadge>
			</template>

			<template #createdAt-cell="{ row }">
				<span class="text-sm text-neutral-500">
					{{ row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—" }}
				</span>
			</template>
		</UTable>
	</div>
</template>
