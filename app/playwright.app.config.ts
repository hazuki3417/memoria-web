import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "./e2e/app",
	use: {
		baseURL: "http://localhost:3000", // アプリのURL
		headless: true,
	},
	reporter: [
		[
			"html",
			{
				outputFolder: "./e2e/app/report",
				open: "never",
			},
		], // 'never'なら自動表示しない（'on'で表示される）
	],
	name: "E2E",
});
