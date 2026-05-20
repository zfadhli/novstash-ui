import "@novstash-ui/env/web";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "latest",
	devtools: { enabled: true },
	experimental: {
		payloadExtraction: "client",
	},
	modules: ["@nuxt/ui", "nuxt-auth-utils"],
	css: ["~/assets/css/main.css"],
	devServer: {
		port: 3001,
	},
	nitro: {
		timing: false,
	},
});
