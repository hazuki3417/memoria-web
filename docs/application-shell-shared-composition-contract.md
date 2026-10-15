# Application Shell shared composition contract

Related: [#110](https://github.com/hazuki3417/memoria-web/issues/110).

## Design decision (2026-10-15)

Prototype, Storybook and the application must render the **same shared UI composition**. Do not introduce environment-specific copies of that composition. Presentational/Container is a **separation of responsibilities**, not a requirement to create a component named Container or to preserve `ApplicationShellContainer`.

- Presentational: shared layout, Header, Navigation, ContextSwitcher, AccountMenu, ContentScroll, shell mode visibility and navigation interaction.
- Integrations: router, authentication, API data, persistence, preview-only community creation and Storybook fixtures are injected through props/callbacks or composed outside the shared UI.
- `ApplicationShell` currently provides the layout primitive with header/navigation slots. A shared higher-level composition may be extracted only when it preserves all existing consumers' visual and behavioral contracts.
- `ApplicationShellContainer` is not a privileged architecture boundary. Evaluate whether it can become a thin integration layer or be removed after shared UI extraction.
- Do not duplicate the UI composition in `PrototypeApplicationShell`, `ProductionApplicationShell` and `ApplicationShellContainer`.
- Do not simplify a consumer to accommodate another; preserve existing props, capabilities and responsive behavior.

## Existing consumers (develop, before refactor)

| Consumer | Current responsibilities |
| --- | --- |
| `src/prototypes/PrototypeApplicationShell.tsx` | shared UI assembly, navigation state, callbacks |
| `src/features/application-shell/ProductionApplicationShell.tsx` | similar UI assembly, Next router, context switching |
| `src/features/application-shell/ApplicationShellContainer.tsx` | actual app layout integration, route-derived context and mode, temporary community creation modal, router |
| `src/components/ApplicationShell/ApplicationShell/ApplicationShell.stories.tsx` | static UI variants, currently assembling UI elements directly |

The application layout imports `ApplicationShellContainer`; `ProductionApplicationShell` had no code-search callers at the time of investigation.

## Contract and regression checklist

1. **Visual:** header height 40px, Drawer position/overlay and width, main scroll behavior, modal portal root, colors, content and spacing remain unchanged.
2. **Navigation:** toggle, Escape/outside close, selection callback, navigation close and route transition. `ApplicationNavigation` already closes on selection; remove duplicate close ownership only after testing.
3. **Context:** current and selectable contexts, switch callback, target path/section preservation, closing navigation, newly created preview contexts.
4. **Mode:** authenticated, pre-registration, restricted-flow visibility, reserved navigation space on restricted routes.
5. **Accounts:** settings and logout behavior, user identity, optional community creation.
6. **Responsive:** mobile/desktop behavior and focus/keyboard operation.
7. **Storybook:** render and exercise shared UI directly using fixtures and callbacks; no Storybook-only composition clone.
8. **Prototype:** preserve current callbacks and navigation behavior, without introducing production-only routing.
9. **Production:** preserve authentication redirects, route-driven context, account actions, preview modal and routing.

## Implementation sequence

1. Add regression coverage for existing UI and interactions.
2. Propose and review a shared composition interface using inputs/callbacks; ensure all consumers' capabilities fit.
3. Extract shared UI composition and migrate Storybook, Prototype and actual application.
4. Remove obsolete duplicate wrappers only after caller verification.
5. Run quality gate, inspect visual/behavioral regressions and verify GitHub state before merging.

**Open design boundary:** whether navigation state is internally owned or optionally controlled, and how reserved header space is represented. Resolve from observed existing behavior, not from the simplest consumer.
