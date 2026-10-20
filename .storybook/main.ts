import type { StorybookConfig } from '@storybook/nextjs-vite';
import { fileURLToPath } from 'node:url';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs"
  ],
  "framework": "@storybook/nextjs-vite",
  viteFinal: async (config) => ({
    ...config,
    resolve: {
      ...config.resolve,
      alias: [
        { find: /^@\//, replacement: `${fileURLToPath(new URL("../src/", import.meta.url))}` },
        ...(Array.isArray(config.resolve?.alias)
          ? config.resolve.alias
          : Object.entries(config.resolve?.alias ?? {}).map(([find, replacement]) => ({
              find,
              replacement,
            }))),
      ],
    },
  }),
  "staticDirs": [
    "../public",
    "../storybook-assets"
  ],
};
export default config;
