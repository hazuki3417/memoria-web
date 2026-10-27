# Global overlays and image detail ownership

## Mount points

- The Next.js root layout mounts one Mantine `<Notifications position="top-right" />` inside `ThemeProvider`. The top-right position is the system-wide notification placement. This supports notifications from authenticated and unauthenticated routes. The Mantine `Notifications.styles.root` API sets its top offset and disables pointer events on the empty container; `styles.notification` retains interactive notification cards. The root notification container reads `--memoria-notification-top`, falling back to the standard Mantine top inset outside the application.
- `ApplicationShell` currently passes numeric `40` to Mantine's `header.height` and `main.top` to preserve its working interaction/layout behavior. The CSS `--memoria-app-header-height` token mirrors that value for notification positioning; this duplication is temporary pending verification of a safe shared source of truth. CSS `:root:has([data-memoria-application-main])` sets `--memoria-notification-top` to that token plus 12px only while the shell exists. No DOM measurement or effect is required; outside the shell the notification uses the standard Mantine top inset. Notifications remain viewport-fixed and outside content scrolling.
- The shared `ApplicationShell` renders `#application-modal-root` outside the scrollable page content. Media Detail's full-screen Mantine Modal uses `portalProps={{ target: "#application-modal-root" }}`, keeping its visual overlay outside page scrolling.
- Browser features call `showNotification` but must not mount another `<Notifications />` in their page content.
- Do not override Mantine internal CSS classes for notifications or assign arbitrary z-index values to standard Menu/Drawer/Header. Use supported component props/styles and rely on library-managed stacking. The Media Detail portal remains an intentional custom exception.

## Application main scroll ownership

- `ApplicationShell` owns the fixed Main viewport (including its available height), Header and Navigation, but **never inserts a scroll area** or page-content padding.
- Route Layouts do not select or impose a scroll area. Feature route layouts may preserve viewport geometry and spacing without creating a scrollport.
- Each Page / Feature owns the Mantine `ScrollArea` enclosing precisely the content intended to scroll. Dashboard scrolls as page content; Media Browser and Group Browser leave their toolbars outside their list scrollports; shared Settings presentation keeps navigation outside the settings-content scrollport.
- Use Mantine `ScrollArea` for every newly implemented scroll area to keep appearance consistent; do not add an independent CSS `overflow-y: auto` scrolling implementation.
- `ApplicationContentScroll` and `StandardPageScroll` are retired. Do not replace either with a common ApplicationShell/Route Layout wrapper that forces all pages to scroll.
- Preserve the existing scroll range, scrollbar interaction, height, `lg` top spacing, focus/navigation behavior and responsive layout. Avoid nested scrollports and duplicate padding, including Media edit/upload routes.
- The notification offset comes from the fixed shell header height and is independent of page / feature scrolling.

## Media Detail consumers and contracts

- Media Browser opens Media Detail from its media list; Group Browser opens the same viewer from Group Detail thumbnails.
- The current `MediaDetailDialog` wrapper delegates to `MediaBrowser` in detail-only mode. The shared portal **does not yet imply shared state ownership**: the viewer, editing dialogs, and state still reside in `MediaBrowser`.
- Preserve the full existing Media Detail visual/behavioral/responsive contract, including previous/next media scope, edit/share dialogs, zoom/rotation, closing behavior, and Group Detail pane state.
- Do not relocate all dialogs indiscriminately: feature-specific dialogs retain their feature state. Global mount points are separate from state ownership.

## Outstanding extraction

[Web Issue #91](https://github.com/hazuki3417/memoria-web/issues/91) tracks extracting the full Media Detail implementation into a reusable dialog, with visual and behavioral regression validation. Do not mark that extraction complete solely because its modal already uses the shared shell portal.
