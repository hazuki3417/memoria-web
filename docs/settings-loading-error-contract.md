# Settings loading and error behavior

Applies to Personal and Community settings (Profile, Preferences, Account, General, Members and Usage).

## Content boundary

- Keep the application header and settings navigation visible during initial loading and failure.
- Render loading/error feedback in the settings content area only, not across the entire shell.
- Use `SettingsLoadBoundary` for initial loading and errors.
- Delay the Loader by 300 ms to avoid flashes from short requests. The Loader is centered inside the content loading region.
- When an initial request fails or mandatory data is missing, display a shared error message asking the user to reload the page. Do not offer a retry button.
- When cached data is available, preserve existing content during background refetch rather than replacing it with a Loader or Skeleton.
- Failure of a background refresh should not discard successfully loaded data; use a nonblocking error notification.
- Preserve authorization flows (including Community membership loss) and existing content interactions.
- Usage does not use a Skeleton as its loading representation. Loading/errors occur before rendering usage content.
- Account also waits for its required CurrentUser data and follows the same boundary rules.

## Component ownership

- GraphQL consumers decide whether required data is available and whether the state is loading or error.
- Settings layout owns the navigation and content region.
- `SettingsLoadBoundary` owns the shared loading and error visualization.
- Content components retain their existing actions and read-only information.

## Visual verification

- `SettingsLoadBoundary.stories.tsx`: Ready, Loading and Error.
- `SettingsUsage.stories.tsx`: Usage loading/error and ready examples.

Verify both desktop and compact viewport behavior and check that the sidebar/navigation is not replaced by loading/error content.
