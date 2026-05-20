import { db, schema } from "@novstash-ui/db";

export default defineEventHandler(async () => {
	const rows = await db
		.select({ genres: schema.novels.genres })
		.from(schema.novels);

	const genreSet = new Set<string>();

	for (const row of rows) {
		if (!row.genres) continue;
		try {
			const parsed: string[] = JSON.parse(row.genres);
			for (const genre of parsed) {
				if (typeof genre === "string" && genre.trim()) {
					genreSet.add(genre.trim());
				}
			}
		} catch {
			// skip malformed JSON
		}
	}

	const genres = [...genreSet].sort((a, b) => a.localeCompare(b));

	return { genres };
});
