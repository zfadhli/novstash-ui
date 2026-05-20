<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();

const items = computed<NavigationMenuItem[]>(() => [
	{ label: "Home", to: "/", active: route.path === "/" },
]);
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
			<UColorModeButton />
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
