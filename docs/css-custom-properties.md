# CSS custom properties: interim principles

## Status and scope

CSS custom properties are permitted in Memoria Web. These are **interim principles**, not a comprehensive naming or styling standard. Revisit the details after sufficient implementation examples have accumulated; track the follow-up in a GitHub issue.

## Interim principles

1. Prefer existing Mantine variables and established design tokens. Do not duplicate a value already provided by the styling system without a concrete reason.
2. Introduce custom properties when they solve a real need, especially a layout value shared across components or a responsive layout boundary. Do not convert every one-off constant into a variable.
3. Scope variables as narrowly as practical. Use document-level variables only when cross-root/portal consumers actually require them.
4. Keep a single source of truth for a shared value; avoid parallel hard-coded copies and document ownership when values cross component boundaries.
5. Consider responsive changes, component mounting/unmounting, and portal boundaries. Avoid JavaScript measurement when existing CSS/layout tokens can meet the requirement, but do not force CSS-only solutions when the actual size is content-driven.
6. Preserve existing visual, behavioral, and responsive contracts when replacing an implementation.

## Deferred decisions

No universal naming convention, file placement convention, variable taxonomy, or mandatory responsive strategy is established yet. Decide these based on demonstrated needs and consolidate them into a formal guideline later.

## Current motivating example

Application Shell header, main viewport, and global notification placement currently share layout concerns (see [global overlays](./global-overlays.md)). Any future refactor to CSS custom properties should first inspect Mantine's AppShell layout variables and avoid introducing a second source of truth. This document does not itself approve or implement a change to notification positioning.
