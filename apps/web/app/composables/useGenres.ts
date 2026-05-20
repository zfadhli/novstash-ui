interface GenresResponse {
	genres: string[];
}

let cachedGenres: string[] | null = null;
let fetchPromise: Promise<string[]> | null = null;

export function useGenres() {
	const genres = ref<string[]>(cachedGenres ?? []);
	const pending = ref(true);
	const error = ref<Error | null>(null);

	async function fetch() {
		if (cachedGenres) {
			genres.value = cachedGenres;
			pending.value = false;
			return;
		}

		if (fetchPromise) {
			await fetchPromise;
			if (cachedGenres) {
				genres.value = cachedGenres;
			}
			pending.value = false;
			return;
		}

		fetchPromise = (async () => {
			try {
				const data = await $fetch<GenresResponse>("/api/genres");
				cachedGenres = data.genres;
				genres.value = data.genres;
			} catch (err) {
				error.value = err as Error;
			} finally {
				pending.value = false;
			}
			return cachedGenres ?? [];
		})();

		await fetchPromise;
	}

	// Fetch on first use
	fetch();

	return {
		genres: readonly(genres),
		pending,
		error,
		refresh: fetch,
	};
}
