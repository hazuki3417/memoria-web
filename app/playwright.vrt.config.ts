import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "./e2e/vrt",
	use: {
		baseURL: "http://localhost:6006", // Storybook の URL
		headless: true,
	},
	reporter: [
		[
			"html",
			{
				outputFolder: "./e2e/vrt/report",
				open: "never",
			},
		], // 'never'なら自動表示しない（'on'で表示される）
	],
	name: "VRT",
});
