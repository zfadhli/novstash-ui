import { execFile } from "node:child_process";
import { resolve } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

// Resolve paths relative to the Nuxt project root (process.cwd() is apps/web/)
const CLI_DIR = resolve(process.cwd(), "../novstash-cli");
const DB_PATH = resolve(CLI_DIR, "novlove.db");

interface ScrapeResult {
	slug: string;
	title?: string;
	author?: string | null;
	chapter_count?: number;
	success: boolean;
	error?: string;
	message?: string;
}

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
		const { stdout } = await execFileAsync(
			"uv",
			[
				"run",
				"--directory",
				CLI_DIR,
				"python",
				"scripts/scrape_novel.py",
				url,
				"--db",
				DB_PATH,
			],
			{ timeout: 180_000 },
		);

		const result: ScrapeResult = JSON.parse(stdout);
		if (!result.success) {
			throw createError({
				statusCode: 500,
				statusMessage: result.error || "Scrape failed",
			});
		}

		return result;
	} catch (err: unknown) {
		if (err instanceof Error && "statusCode" in err) throw err;
		const msg = err instanceof Error ? err.message : String(err);
		console.error("[scrape]", msg);
		throw createError({
			statusCode: 500,
			statusMessage: `Scrape failed: ${msg}`,
		});
	}
});
