# Settings loading and error behavior

Applies to Personal and Community settings (Profile, Preferences, Account, General, Members and Usage).

## Content boundary

- Keep the application header and settings navigation visible during initial loading and failure.
- Render loading/error feedback in the page content area only, not across the entire shell.
- Use `PageStatusBoundary` for initial loading and errors.
- Delay the Loader by 300 ms to avoid flashes from short requests. The Loader is centered inside the content loading region.
- When an initial request fails or mandatory data is missing, display a shared error message asking the user to reload the page. The reusable `PageStatusBoundary` itself does not provide retry. Usage is a deliberate exception at the Feature UI level: its initial error adds a `再試行` action that refetches the current Custodian's Usage.
- When cached data is available, preserve existing content during background refetch rather than replacing it with a Loader or Skeleton.
- Failure of a background refresh should not discard successfully loaded data; use a nonblocking error notification.
- Preserve authorization flows (including Community membership loss) and existing content interactions.
- Usage does not use a Skeleton as its loading representation. The shared `Usage` UI renders the existing `PageStatusBoundary` Loader/Error before presenting Usage content; Context-specific connections supply the state and retry callback.
- Account also waits for its required CurrentUser data and follows the same boundary rules.

## Component ownership

- GraphQL consumers decide whether required data is available and whether the state is loading or error.
- Settings layout owns the navigation and content region.
- `src/components/PageStatusBoundary/PageStatusBoundary.tsx` owns the reusable page-level loading and error visualization.
- Content components retain their existing actions and read-only information.

## Visual verification

- `src/components/PageStatusBoundary/PageStatusBoundary.stories.tsx`: Ready, Loading, Error and custom messages.
- `SettingsUsage.stories.tsx`: Usage loading/error and ready examples.

Verify both desktop and compact viewport behavior and check that the sidebar/navigation is not replaced by loading/error content.
