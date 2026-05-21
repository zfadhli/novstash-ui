import { resolve } from "node:path";

const SIDECAR_URL = process.env.SCRAPE_SIDECAR_URL || "http://127.0.0.1:8765";

export default defineEventHandler(async (event) => {
	await ensureAdmin(event);

	const { url } = await readBody<{ url: string }>(event);
	if (!url || typeof url !== "string") {
		throw createError({ statusCode: 400, statusMessage: "url is required" });
	}

	try {
		new URL(url);
	} catch {
		throw createError({ statusCode: 400, statusMessage: "Invalid URL" });
	}

	try {
		const result = await $fetch(`${SIDECAR_URL}/scrape`, {
			method: "POST",
			body: { url, db_path: resolve(process.cwd(), "../../local.db") },
			timeout: 600_000,
		});
		return result;
	} catch (err: any) {
		if (err.statusCode) throw err;
		console.error("[scrape] Sidecar error:", err.message);
		throw createError({
			statusCode: 500,
			statusMessage: `Scrape failed: ${err.message}`,
		});
	}
});
