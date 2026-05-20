interface GenresResponse {
	genres: string[];
}

export function useGenres() {
	const genres = ref<string[]>([]);
	const loading = ref(false);

	onMounted(async () => {
		if (loading.value || genres.value.length > 0) return;
		loading.value = true;
		try {
			const data = await $fetch<GenresResponse>("/api/genres");
			genres.value = data.genres;
		} catch (e) {
			console.error("Failed to fetch genres:", e);
			genres.value = [];
		} finally {
			loading.value = false;
		}
	});

	return { genres, loading };
}
