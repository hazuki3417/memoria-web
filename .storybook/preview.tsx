import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import type { Preview } from '@storybook/nextjs-vite';
import { theme } from "../src//lib/theme";
import { ThemeProvider } from "../src/providers/ThemeProvider";
import { PrototypeApplicationShell } from "../src/prototypes/PrototypeApplicationShell";
import type { ApplicationContextOption, ApplicationNavigationItem } from "../src/components/ApplicationShell";

// Opt-in: parameters.applicationShell = { currentContext, contexts, navigationItems, ... }
type StoryApplicationShell = {
  currentContext: ApplicationContextOption;
  contexts: ApplicationContextOption[];
  navigationItems: ApplicationNavigationItem[];
  user?: { displayName: string; avatarLabel?: string };
};


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
    (Story, context) => {
      const applicationShell = context.parameters.applicationShell as StoryApplicationShell | undefined;
      const portalOwnedByStory = context.parameters.applicationShellOwnsPortal === true;
      return (
        <ThemeProvider theme={theme}>
          {applicationShell ? (
            <PrototypeApplicationShell {...applicationShell}>
              <Story />
            </PrototypeApplicationShell>
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
