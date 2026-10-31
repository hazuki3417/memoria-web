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

- Personal URL-aligned Storybook branches: `Features/Settings/Profile`, `Features/Settings/Preferences`, `Features/Settings/Account`, `Features/Settings/Usage`. Profile interaction stories remain under Profile.
- Community URL-aligned Storybook branches: `Features/Community Settings/Settings` (the `/settings` general screen), `/Members`, `/Preferences`, `/Usage`. All member interactions remain under Members.
- Existing `SettingsLoadLayout.stories.tsx` and `PageStatusBoundary.stories.tsx` cover loading and error layout.

## Verification requirements

Before merging, verify TypeScript, formatting/lint, Storybook interactions, visual regression at desktop and mobile widths, and navigation, saving, permission-loss and loading behavior against the pre-refactor implementation.

## Outstanding behavioral verification

- `useCommunitySettingsActions.test.ts` covers mocked GraphQL mutation responses for rename, member removal, role updates and leave, including refetch arguments and notifications. The test has been committed but not executed yet. Storybook interaction cases cover member removal success/failure, role change success/failure, Community leave success/failure, and confirmation modal behavior. The final-Administrator guard remains in force; leave scenarios use two administrators.
- The VRT runner (`tests/vrt/storybook.spec.mts`) captures all `vrt`-tagged stories across Compact (375×812), Medium (1024×768) and Wide (1440×900) viewports. Existing settings loading/error VRT cases cover the shared page status in both viewport classes; run VRT and compare baselines before merge. New interaction stories are not claimed as passing until the runner executes.
- Verify actual component rendering at desktop and compact widths; the GitHub file edits have not yet been executed against a local TypeScript/Storybook runtime.
- Current work branch may be behind `develop`. Reconcile its changes before requesting a merge, without changing the existing UI contract.

Page-level Storybook titles follow the leaf segment of the browser route. Reusable state/layout and Usage contract stories can remain separate from route-specific branches as cross-page test surfaces.

## Extended Storybook contracts

- Personal Profile: unchanged input, required nickname, successful save, retryable save failure and blocked save.
- Personal Preferences: all setting fields are present and Media Detail navigation wrap can be toggled.
- Personal Account: account deletion action links to `/settings/account/delete`.
- Community General: Community name editing, invalid input, saving and member read-only states.
- Community Members: search and membership confirmation success/failure cases.
- Usage: the existing dedicated Usage contract stories remain authoritative for usage calculation and display behavior.

The new stories and interaction tests are committed but their successful execution and visual baselines have not been verified in this environment.

## Component Directory移行（作業中）

合意済みの横断規約により、exportするReact Componentは同名Directory内に実装し、`index.ts`を公開入口とする。現在の設定機能では`Settings`、`SettingsSectionContent`、`SettingsLayout`、`SettingsProfile`、`SettingsPreferences`、`SettingsAccount`、`CommunitySettings`、`CommunitySettingsContent`、`CommunityGeneralContent`、`CommunityMembersContent`、`CommunityPreferencesContent`、`CommunityDangerZone`を移行した。ページ別Storyは対象表示Componentと近接配置する。残りのComponentのDirectory移行、import参照確認、TypeScript・Storybook・VRTの実行確認が必要であり、完了扱いにしない。
