import DOMPurify from "dompurify";
import { marked } from "marked";

// Configure marked
marked.setOptions({
	breaks: true, // Convert \n to <br>
	gfm: true, // GitHub Flavored Markdown
});

export function useMarkdown() {
	function render(md: string): string {
		const raw = marked.parse(md, { async: false }) as string;
		if (import.meta.client) {
			return DOMPurify.sanitize(raw);
		}
		return raw;
	}

	return { render };
}
