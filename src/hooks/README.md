# Responsive viewport classification

`useResponsiveViewport()` classifies the **viewport** into `compact`, `medium`, or `wide` after hydration. On the server and the first client render, it returns `{ category: null, isResolved: false }` to avoid guessing a device width and to keep hydration markup consistent.

The current **candidate**, not the finalized design decision, uses Mantine theme breakpoints `sm` and `xl` (see [Issue #58](https://github.com/hazuki3417/memoria-web/issues/58)). The hook intentionally reads from the active Mantine theme instead of duplicating pixel values.

Consumers must handle `null` explicitly; do not render a different initial DOM structure based on an assumed desktop or mobile viewport. The hook does not own a loading state, screen layout, or feature capabilities. Prefer responsive CSS when a JavaScript decision is unnecessary. Introducing this hook does not authorize changing existing consumers or their responsive contracts.

The classification is primarily a shared design/review/testing vocabulary, not a mandatory breakpoint for each component's layout.

## Usage policy

Prefer Mantine responsive props, CSS media/container queries, Grid, and Flexbox for presentation and layout. Do **not** use this hook merely to toggle inline styles or class names: client-side media-query updates can flash an incorrect layout even without changing the component tree. Use this hook only when a change in component structure, behavior, or state requires JavaScript.

An incorrect responsive layout must not appear, even briefly, on initial display. A consumer that needs the hook must explicitly handle `category: null` without temporarily rendering either the Compact or Wide layout. Choose a stable initial presentation suited to the feature rather than introducing an app-wide loading screen. Validate initial display and interaction behavior for each such consumer.
