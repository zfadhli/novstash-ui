<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();

const sidebarItems: NavigationMenuItem[] = [
	{ label: "Dashboard", icon: "lucide:layout-dashboard", to: "/admin" },
	{ label: "Novels", icon: "lucide:book-open", to: "/admin/novels" },
	{ label: "Users", icon: "lucide:users", to: "/admin/users" },
];
</script>

<template>
	<div class="flex h-screen">
		<aside
			class="w-60 shrink-0 border-r border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950"
		>
			<div class="mb-6 flex items-center gap-2 px-2">
				<UIcon name="lucide:book-heart" class="size-5 text-emerald-500" />
				<span class="text-sm font-bold">Admin</span>
			</div>
			<UNavigationMenu :items="sidebarItems" orientation="vertical" />
		</aside>
		<main class="flex-1 overflow-y-auto">
			<div
				class="border-b border-neutral-200 bg-white px-6 py-3 dark:border-neutral-800 dark:bg-neutral-900"
			>
				<UButton to="/" variant="ghost" size="sm" icon="lucide:arrow-left">
					Back to site
				</UButton>
			</div>
			<div class="p-6">
				<slot />
			</div>
		</main>
	</div>
</template>
