<script setup lang="ts">
interface PaginationItem {
	type: "page" | "ellipsis";
	value: number;
}

const props = defineProps<{
	modelValue: number;
	totalPages: number;
}>();

const emit = defineEmits<{
	"update:modelValue": [value: number];
}>();

const pages = computed(() => {
	const total = props.totalPages;
	const current = props.modelValue;

	if (total <= 7) {
		return Array.from({ length: total }, (_, i) => ({
			type: "page" as const,
			value: i + 1,
		}));
	}

	const result: PaginationItem[] = [];
	result.push({ type: "page", value: 1 });

	if (current > 4) {
		result.push({ type: "ellipsis", value: -1 });
	}

	const start = Math.max(2, current - 2);
	const end = Math.min(total - 1, current + 2);

	for (let i = start; i <= end; i++) {
		result.push({ type: "page", value: i });
	}

	if (current < total - 3) {
		result.push({ type: "ellipsis", value: -2 });
	}

	if (total > 1) {
		result.push({ type: "page", value: total });
	}

	return result;
});

function goTo(p: number) {
	emit("update:modelValue", p);
}
</script>

<template>
	<div
		v-if="totalPages > 1"
		class="mt-10 flex items-center justify-center gap-2"
	>
		<UButton
			variant="soft"
			:disabled="modelValue <= 1"
			@click="goTo(modelValue - 1)"
		>
			Previous
		</UButton>

		<div class="flex items-center gap-1">
			<template v-for="p in pages" :key="p.value">
				<span
					v-if="p.type === 'ellipsis'"
					class="px-2 text-neutral-400 dark:text-neutral-500"
				>...</span>
				<UButton
					v-else
					:variant="p.value === modelValue ? 'solid' : 'soft'"
					size="sm"
					@click="goTo(p.value)"
				>
					{{ p.value }}
				</UButton>
			</template>
		</div>

		<UButton
			variant="soft"
			:disabled="modelValue >= totalPages"
			@click="goTo(modelValue + 1)"
		>
			Next
		</UButton>
	</div>
</template>
