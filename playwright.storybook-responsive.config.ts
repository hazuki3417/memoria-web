import { defineConfig, devices } from "@playwright/test"

// StorybookのResponsive Preview検証。画像はreview用でありVRT Baselineではない。
export default defineConfig({
  testDir: "./tests/storybook-responsive",
  fullyParallel: true,
  reporter: [["list"], ["html", {
    outputFolder: "tests/storybook-responsive/report",
    open: "never",
  }]],
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:6006",
    locale: "ja-JP",
    colorScheme: "light",
    deviceScaleFactor: 1,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev:storybook -- --ci --no-open",
    url: "http://127.0.0.1:6006/index.json",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
