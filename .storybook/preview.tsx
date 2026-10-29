import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import type { Preview } from '@storybook/nextjs-vite';
import { theme } from "../src//lib/theme";
import { ThemeProvider } from "../src/providers/ThemeProvider";
import { StorybookApplicationShell } from "./StorybookApplicationShell";
import { responsiveViewports } from "./responsiveViewports";


const preview: Preview = {
  parameters: {
    // Shared representative review sizes. An interactive viewport toolbar
    // requires the separate Storybook viewport addon to be installed/enabled.
    viewport: {
      options: {
        compact: {
          name: "Compact",
          styles: { width: `${responsiveViewports.compact.width}px`, height: `${responsiveViewports.compact.height}px` },
        },
        medium: {
          name: "Medium",
          styles: { width: `${responsiveViewports.medium.width}px`, height: `${responsiveViewports.medium.height}px` },
        },
        wide: {
          name: "Wide",
          styles: { width: `${responsiveViewports.wide.width}px`, height: `${responsiveViewports.wide.height}px` },
        },
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
      const portalOwnedByStory = context.parameters.applicationShellOwnsPortal === true;
      return (
        <ThemeProvider theme={theme}>
          {applicationShell ? (
            <StorybookApplicationShell>
              <Story />
            </StorybookApplicationShell>
          ) : (
            <>
              {/* ApplicationShell非使用Storyにも本番と同じModal Portal先を提供する */}
              {!portalOwnedByStory && (
                <div id="application-modal-root" style={{ position: "relative", zIndex: 400 }} />
              )}
              <Story />
            </>
          )}
        </ThemeProvider>
      );
    }
  ]
};

export default preview;
