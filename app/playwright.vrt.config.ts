import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/vrt',
  use: {
    baseURL: 'http://localhost:6006', // Storybook の URL
  },
  name: 'VRT',
});
