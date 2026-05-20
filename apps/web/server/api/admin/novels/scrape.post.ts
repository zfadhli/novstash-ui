import { spawn } from "node:child_process";
import { resolve } from "node:path";

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

	try {
		const result = await new Promise<string>(
			(resolvePromise, rejectPromise) => {
				const stdout: Buffer[] = [];
				const stderr: Buffer[] = [];

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

				child.stdout.on("data", (data: Buffer) => {
					stdout.push(data);
				});

				child.stderr.on("data", (data: Buffer) => {
					stderr.push(data);
				});

				child.on("close", (code) => {
					const stdoutStr = Buffer.concat(stdout).toString().trim();
					const stderrStr = Buffer.concat(stderr).toString().trim();

					if (code === 0 && stdoutStr) {
						resolvePromise(stdoutStr);
					} else if (code === 0 && !stdoutStr) {
						rejectPromise(
							new Error("Process exited with code 0 but produced no output"),
						);
					} else {
						const msg = stderrStr
							? `Process exited with code ${code}: ${stderrStr}`
							: `Process exited with code ${code}`;
						rejectPromise(new Error(msg));
					}
				});

				child.on("error", (err) => {
					rejectPromise(err);
				});
			},
		);

		return JSON.parse(result);
	} catch (err: any) {
		console.error("[scrape]", err.message);
		throw createError({
			statusCode: 500,
			statusMessage: `Scrape failed: ${err.message}`,
		});
	}
});
