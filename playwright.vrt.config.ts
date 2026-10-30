import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/vrt/generated",
  fullyParallel: true,
  reporter: [["list"], ["html", { outputFolder: "tests/vrt/report", open: "never" }]],
  snapshotPathTemplate: "tests/vrt/__screenshots__/{arg}{ext}",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:6006",
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    locale: "ja-JP",
    colorScheme: "light",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev:storybook -- --ci --no-open",
    url: "http://127.0.0.1:6006/index.json",
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
