import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import type { Preview } from '@storybook/nextjs-vite';
import { theme } from "../src//lib/theme";
import { ThemeProvider } from "../src/providers/ThemeProvider";


const preview: Preview = {
  parameters: {
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
    (Story) => (
      <ThemeProvider theme={theme}>
        <Story />
      </ThemeProvider>
    )
  ]
};

export default preview;
