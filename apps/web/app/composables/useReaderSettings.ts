export type ReaderTheme = "sepia" | "dark" | "light";
export type ReaderFont = "serif" | "sans" | "mono";

interface ReaderSettings {
	fontSize: number;
	lineHeight: number;
	fontFamily: ReaderFont;
	theme: ReaderTheme;
	maxWidth: number;
}

const defaults: ReaderSettings = {
	fontSize: 18,
	lineHeight: 1.8,
	fontFamily: "sans",
	theme: "dark",
	maxWidth: 540,
};

export function useReaderSettings() {
	const settings = useState<ReaderSettings>("reader-settings", () => {
		if (import.meta.client) {
			try {
				const stored = localStorage.getItem("novstash-reader-settings");
				if (stored) {
					return { ...defaults, ...JSON.parse(stored) };
				}
			} catch {
				// ignore parse errors
			}
		}
		return { ...defaults };
	});

	function persist() {
		if (import.meta.client) {
			localStorage.setItem(
				"novstash-reader-settings",
				JSON.stringify(settings.value),
			);
		}
	}

	function setFontSize(size: number) {
		settings.value.fontSize = Math.max(12, Math.min(36, size));
		persist();
	}

	function setLineHeight(height: number) {
		settings.value.lineHeight = Math.max(1.2, Math.min(3, height));
		persist();
	}

	function setFontFamily(font: ReaderFont) {
		settings.value.fontFamily = font;
		persist();
	}

	function setTheme(theme: ReaderTheme) {
		settings.value.theme = theme;
		persist();
	}

	function setMaxWidth(width: number) {
		settings.value.maxWidth = Math.max(480, Math.min(960, width));
		persist();
	}

	function reset() {
		settings.value = { ...defaults };
		persist();
	}

	return {
		settings,
		setFontSize,
		setLineHeight,
		setFontFamily,
		setTheme,
		setMaxWidth,
		reset,
	};
}
