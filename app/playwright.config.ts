import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    viewport: { width: 800, height: 600 },
    screenshot: 'only-on-failure',
    headless: true,
  },
});
