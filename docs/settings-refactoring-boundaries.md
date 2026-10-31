# Settings page responsibility boundaries

This refactoring preserves the established UI and behavior of Personal and Community settings. No setting fields, actions, navigation entries, responsive breakpoints, loading delays, or error transitions may be removed solely to facilitate reuse.

## Personal Settings

- `ConnectedSettings` fetches CurrentUser, resolves the page state and connects data to presentation.
- `usePersonalSettingsActions` owns profile/preferences mutations, confirmation and the CurrentUser refetch contract.
- `Settings` owns page routing and composition with the existing SettingsLayout.
- `SettingsSectionContent` owns only choosing and rendering the existing Profile, Preferences, Account and Usage content; it does not fetch data.
- `ConnectedPersonalSettingsSection` keeps the established Account/Usage dependency differences.

## Community Settings

- `CommunitySettingsRoute` composes the data source, loading/error boundary, existing section navigation and mutation callbacks returned by the actions hook.
- `useCommunitySettingsActions` owns Community renaming, member removal, role updates and leaving mutations. It preserves the existing success/error notifications, return values, refetch queries and confirmation semantics.
- `useCommunitySettingsMembership` owns membership lookup, accent selection and the existing Preferences membership-loss redirect.
- `CommunitySettings` owns responsive navigation, prototype section selection, name/invitation state and page layout.
- `CommunitySettingsContent` owns only choosing existing General, Members, Preferences and Usage content.
- `ConnectedCommunityPreferences` retains its existing network/cache and save ordering responsibilities.

## Shared status presentation

`src/components/PageStatusBoundary` remains the shared page-level Loading/Error/Ready presentation, regardless of whether Personal, Community or Usage consumes it. The 300 ms delay, no manual retry, content-region placement and background-refresh behavior remain unchanged.

## Stories

- `SettingsSectionContent.stories.tsx`: Personal Profile, Preferences, Account, Usage, Profile save callback and required nickname validation.
- `CommunitySettings.sections.stories.tsx`: Community General, Members, Preferences, Usage and member search.
- Existing `SettingsLoadLayout.stories.tsx` and `PageStatusBoundary.stories.tsx` cover loading and error layout.

## Verification requirements

Before merging, verify TypeScript, formatting/lint, Storybook interactions, visual regression at desktop and mobile widths, and navigation, saving, permission-loss and loading behavior against the pre-refactor implementation.

## Outstanding behavioral verification

- `useCommunitySettingsActions.test.ts` covers mocked GraphQL mutation responses for rename, member removal, role updates and leave, including refetch arguments and notifications. The test has been committed but not executed yet. Storybook interaction cases cover member removal success/failure, role change success/failure, Community leave success/failure, and confirmation modal behavior. The final-Administrator guard remains in force; leave scenarios use two administrators.
- The VRT runner (`tests/vrt/storybook.spec.mts`) captures all `vrt`-tagged stories across Compact (375×812), Medium (1024×768) and Wide (1440×900) viewports. Existing settings loading/error VRT cases cover the shared page status in both viewport classes; run VRT and compare baselines before merge. New interaction stories are not claimed as passing until the runner executes.
- Verify actual component rendering at desktop and compact widths; the GitHub file edits have not yet been executed against a local TypeScript/Storybook runtime.
- Current work branch may be behind `develop`. Reconcile its changes before requesting a merge, without changing the existing UI contract.
