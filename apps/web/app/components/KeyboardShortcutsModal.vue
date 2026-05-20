<script setup lang="ts">
const open = defineModel<boolean>("open", { required: true });

const shortcuts = [
	{ key: "←", label: "Previous chapter" },
	{ key: "→", label: "Next chapter" },
	{ key: "s", label: "Toggle settings panel" },
	{ key: "c", label: "Toggle chapter drawer" },
	{ key: "t", label: "Cycle theme (Sepia → Light → Dark)" },
	{ key: "?", label: "Toggle this modal" },
	{ key: "f", label: "Toggle fullscreen" },
];
</script>

<template>
  <USlideover
    v-model:open="open"
    title="Keyboard Shortcuts"
    description="Navigate the reader faster with these shortcuts"
    :side="'right'"
  >
    <template #body>
      <div class="space-y-1 px-2 py-4">
        <div
          v-for="shortcut in shortcuts"
          :key="shortcut.key"
          class="flex items-center justify-between rounded-lg px-3 py-3 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
        >
          <span class="text-sm text-neutral-700 dark:text-neutral-300">
            {{ shortcut.label }}
          </span>
          <kbd
            class="inline-flex h-7 min-w-[2rem] items-center justify-center rounded-md border border-neutral-200 bg-white px-2 text-xs font-semibold text-neutral-600 shadow-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
          >
            {{ shortcut.key }}
          </kbd>
        </div>
      </div>
    </template>
  </USlideover>
</template>
