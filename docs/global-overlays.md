# Global overlays and image detail ownership

## Mount points

- The Next.js root layout mounts one Mantine `<Notifications position="top-right" />` inside `ThemeProvider`. The top-right position is the system-wide notification placement. This supports notifications from authenticated and unauthenticated routes. The root notification container reads `--memoria-notification-top`, falling back to the standard Mantine top inset outside the application.
- `ApplicationShell` measures the top edge of `AppShell.Main` (not a duplicated header height) and sets `--memoria-notification-top` to that edge plus 12px. It updates on viewport/main resize and clears the override on unmount. Notifications remain viewport-fixed and outside the scrolling `ScrollArea`.
- The shared `ApplicationShell` renders `#application-modal-root` outside the scrollable page content. Image Detail's full-screen Mantine Modal uses `portalProps={{ target: "#application-modal-root" }}`, keeping its visual overlay outside page scrolling.
- Browser features call `showNotification` but must not mount another `<Notifications />` in their page content.

## Application main scroll ownership

- `ApplicationShell` owns the fixed main viewport and does not impose a `ScrollArea` or content padding on its children.
- Each consumer explicitly chooses whether to use `ApplicationContentScroll`. This wrapper preserves the previous `ScrollArea` behavior (`type="hover"`, 100% width/height, contained overscroll, and `lg` top padding).
- The production Application Shell container and existing production/prototype consumers currently opt in to preserve existing scrolling and layout. Future consumers may omit the wrapper and manage scrolling themselves; existing consumers should only change this after visual/behavioral regression review.
- The notification offset remains anchored to the `AppShell.Main` bounds and is unaffected by the content scroll choice.

## Image Detail consumers and contracts

- Media Browser opens Image Detail from its media list; Group Browser opens the same viewer from Group Detail thumbnails.
- The current `ImageDetailDialog` wrapper delegates to `MediaBrowser` in detail-only mode. The shared portal **does not yet imply shared state ownership**: the viewer, editing dialogs, and state still reside in `MediaBrowser`.
- Preserve the full existing Image Detail visual/behavioral/responsive contract, including previous/next media scope, edit/share dialogs, zoom/rotation, closing behavior, and Group Detail pane state.
- Do not relocate all dialogs indiscriminately: feature-specific dialogs retain their feature state. Global mount points are separate from state ownership.

## Outstanding extraction

[Web Issue #91](https://github.com/hazuki3417/memoria-web/issues/91) tracks extracting the full Image Detail implementation into a reusable dialog, with visual and behavioral regression validation. Do not mark that extraction complete solely because its modal already uses the shared shell portal.
