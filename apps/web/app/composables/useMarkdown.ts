import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";

marked.setOptions({
	breaks: true,
	gfm: true,
});

export function useMarkdown() {
	function render(md: string): string {
		const raw = marked.parse(md, { async: false }) as string;
		return DOMPurify.sanitize(raw);
	}

	return { render };
}
