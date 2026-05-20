<script setup lang="ts">
definePageMeta({ middleware: "admin-auth", layout: "admin" });
</script>

<template>
	<div>
		<h1 class="mb-6 font-serif text-2xl font-bold">Dashboard</h1>
		<p class="text-neutral-500 dark:text-neutral-400">
			Welcome to the admin dashboard. Use the sidebar to manage novels and users.
		</p>
	</div>
</template>
