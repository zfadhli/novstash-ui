import type { WatchSource } from "vue";
import { onUnmounted, watch } from "vue";

export function useDebouncedWatch<T>(
	source: WatchSource<T> | WatchSource<T>[],
	// biome-ignore lint/suspicious/noExplicitAny: Vue's watch supports both single and multi-source; callback value can be T or T[]
	callback: (val: any) => void,
	delay = 300,
) {
	let timer: ReturnType<typeof setTimeout> | null = null;

	// biome-ignore lint/suspicious/noExplicitAny: Vue's watch accepts heterogeneous source arrays
	watch(source as any, (val: any) => {
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => callback(val), delay);
	});

	onUnmounted(() => {
		if (timer) clearTimeout(timer);
	});
}
