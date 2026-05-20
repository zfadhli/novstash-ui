<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();
const { loggedIn, user, logout } = useUser();

const items = computed<NavigationMenuItem[]>(() => [
	{ label: "Home", to: "/", active: route.path === "/" },
	{ label: "Search", to: "/search", active: route.path === "/search" },
	{ label: "Library", to: "/library", active: route.path === "/library" },
]);

const dropdownItems = computed(() => {
	if (!user.value) return [];

	return [
		{
			type: "label" as const,
			label: user.value.name || "User",
			description: user.value.email || "",
			class: "font-semibold",
		},
		{ type: "separator" as const },
		{
			label: "Settings",
			icon: "lucide:settings",
			to: "/settings",
		},
		{
			label: "Logout",
			icon: "lucide:log-out",
			onSelect: () => {
				logout();
				navigateTo("/");
			},
		},
	];
});
</script>

<template>
	<UHeader>
		<template #left>
			<div class="flex items-center gap-3">
				<Icon
					name="lucide:book-heart"
					class="size-6 text-emerald-500"
				/>
				<span class="hidden text-lg font-bold tracking-tight sm:inline">
					Novstash
				</span>
			</div>
			<UNavigationMenu :items="items" class="ml-6" />
		</template>

		<template #right>
			<div class="flex items-center gap-2">
				<UButton
					v-if="!loggedIn"
					variant="outline"
					size="sm"
					icon="lucide:chrome"
					@click="navigateTo('/auth/google')"
				>
					Sign in with Google
				</UButton>

				<UDropdownMenu
					v-else
					:items="dropdownItems"
					:content="{ align: 'end', sideOffset: 8 }"
				>
					<UAvatar
						:src="user?.avatar || undefined"
						:text="user?.name?.charAt(0)?.toUpperCase() || '?'"
						size="sm"
						class="cursor-pointer ring-2 ring-transparent transition-all duration-200 hover:ring-emerald-500/50"
						:alt="user?.name || 'User avatar'"
					/>
				</UDropdownMenu>

				<UColorModeButton />
			</div>
		</template>

		<template #body>
			<UNavigationMenu
				:items="items"
				orientation="vertical"
				class="-mx-2.5"
			/>
		</template>
	</UHeader>
</template>
