import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import type { Preview } from '@storybook/nextjs-vite';
import { theme } from "../src//lib/theme";
import { ThemeProvider } from "../src/providers/ThemeProvider";
import { StorybookApplicationShell } from "./StorybookApplicationShell";


const preview: Preview = {
  parameters: {
    // Storybook standard: component previews have breathing room by default.
    // Viewport-based UI (pages, dialogs and overlays) opts into fullscreen in its meta.
    layout: "padded",
    options: {
      // Keep each component's visual scenarios together before interaction tests.
      // Sorting by display name preserves story IDs and existing VRT baselines.
      storySort: (a, b) => {
        if (a[1].title !== b[1].title) return 0;

        const group = (name = "") =>
          name.startsWith("Visual ·")
            ? 0
            : name.startsWith("Interaction ·")
              ? 1
              : 2;
        return group(a[1].name) - group(b[1].name);
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
  decorators: [
    (Story, context) => {
      const applicationShell = context.parameters.applicationShell === true;
      return (
        <ThemeProvider theme={theme}>
          {applicationShell ? (
            <StorybookApplicationShell>
              <Story />
            </StorybookApplicationShell>
          ) : (
            <Story />
          )}
        </ThemeProvider>
      );
    }
  ]
};

export default preview;
