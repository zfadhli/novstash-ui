import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { createInterface } from "node:readline";

// Resolve paths relative to the Nuxt project root (process.cwd() is apps/web/)
const CLI_DIR = resolve(process.cwd(), "../novstash-cli");
const DB_PATH = resolve(process.cwd(), "../../local.db");

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

	// SSE headers for streaming progress
	setHeaders(event, {
		"content-type": "text/event-stream",
		"cache-control": "no-cache",
		connection: "keep-alive",
		"x-accel-buffering": "no",
	});

	const child = spawn(
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
		{
			timeout: 600_000,
			stdio: ["ignore", "pipe", "pipe"],
		},
	);

	return new Promise<void>((resolve) => {
		let resolved = false;

		const done = () => {
			if (!resolved) {
				resolved = true;
				resolve();
			}
		};

		const rl = createInterface({ input: child.stdout });

		rl.on("line", (line: string) => {
			try {
				const parsed = JSON.parse(line);
				event.node.res.write(`data: ${JSON.stringify(parsed)}\n\n`);

				// Final result — has "success" key
				if (parsed.success !== undefined) {
					rl.close();
					child.kill();
					event.node.res.end();
					done();
				}
			} catch {
				// Non-JSON line → progress message
				event.node.res.write(
					`data: ${JSON.stringify({ type: "progress", message: line })}\n\n`,
				);
			}
		});

		child.on("exit", (code) => {
			if (!resolved) {
				event.node.res.write(
					`data: ${JSON.stringify({
						success: false,
						error: `Process exited with code ${code}`,
					})}\n\n`,
				);
				event.node.res.end();
				done();
			}
		});

		child.on("error", (err) => {
			if (!resolved) {
				event.node.res.write(
					`data: ${JSON.stringify({
						success: false,
						error: err.message,
					})}\n\n`,
				);
				event.node.res.end();
				done();
			}
		});
	});
});
