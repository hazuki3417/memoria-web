import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e/vrt",
  use: {
    baseURL: "http://127.0.0.1:6006",
    headless: true,
  },
  webServer: {
    command: "npx storybook dev -p 6006 --ci --no-open",
    url: "http://127.0.0.1:6006/index.json",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  reporter: [["html", { outputFolder: "./e2e/vrt/report", open: "never" }]],
  name: "VRT",
});
