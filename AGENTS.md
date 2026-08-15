# AGENTS.md

## Repository role

This repository implements the Memoria web application. Memoria is one product split across these repositories:

- `memoria-web`: this Next.js application
- `memoria-api`: Go GraphQL API and persistence logic
- `memoria-design`: product terminology and cross-repository design documentation
- `memoria-IaC`: AWS CDK infrastructure

Treat `memoria-design` as the product-level source of truth. Report discrepancies between documentation, the checked-in GraphQL schema, and observed API behavior.

## Application boundaries

- Routes and layouts live under `src/app`.
- Reusable UI primitives live under `src/components`.
- Product-level composed UI lives under `src/feature`.
- Cross-cutting providers live under `src/providers`.
- GraphQL source operations and fragments live under `src/graphql/operation` and `src/graphql/fragment`.
- Generated GraphQL client code lives under `src/graphql/gql`.
- Keep server-only environment values and credentials out of client components and browser bundles.
- Preserve authenticated and public route boundaries.

## Local environment

The supported reproducible environment is Devbox with Node.js 24.

```sh
devbox shell
npm ci
npm run dev:next
```

Storybook is available with `npm run dev:storybook`. Do not commit secrets, local environment files, Playwright reports, or generated build directories.

## Validation

Run checks that match the change, then run the baseline before completion.

```sh
npx biome check src
npx tsc --noEmit
npm run test:unit
npm run build:next
```

For visual or interaction changes, also use the relevant suite:

```sh
npm run build:storybook
npm run test:vrt
npm run test:app
```

Visual regression baselines must only be updated after inspecting the rendered difference; never accept snapshots solely to make a test pass.

## GraphQL workflow

- The checked-in client schema under `src/graphql/schema` mirrors the API contract owned by `memoria-api/schemas/graphql`.
- Change operations or fragments first and run `npm run gen:graphql`.
- Commit source GraphQL documents and generated client output together.
- Do not hand-edit `src/graphql/gql`.
- When the API schema changes, identify the API PR or commit that provides the contract and verify nullability, scalars, upload behavior, and pagination semantics.
- Do not make speculative client workarounds for an API contract mismatch without documenting the decision.

## Working agreement

1. Read the affected route, component/feature, provider, GraphQL operation, and tests before editing.
2. Prefer existing Mantine components and established Memoria patterns over introducing another UI system.
3. Use the ubiquitous language documented in `memoria-design/pages/ubiquitous.mdx` for user-facing terms.
4. Keep changes within this repository unless cross-repository work is explicitly requested.
5. For cross-repository changes, use separate branches and PRs and link the contract dependency.
6. Add unit tests for logic and Storybook or Playwright coverage for consequential UI behavior.
7. Do not change authentication, cookies, CSRF behavior, or environment-variable exposure without explicit security review.

## Code Review Rules

- Flag server secrets, tokens, or unvalidated environment values exposed through client components or browser bundles.
- Flag authenticated data access that can execute without the established authentication guards.
- Flag GraphQL source changes whose generated output is stale or whose API contract dependency is unidentified.
- Flag cache updates that can mix users, image groups, or pagination connections.
- Flag upload and download flows that omit file-size, content-type, authorization, or failure handling.
- Flag user-visible terminology inconsistent with the Memoria ubiquitous-language documentation.
- Flag visual changes without a deliberate Storybook/VRT decision.
- Leave formatting and other deterministic checks to Biome, TypeScript, tests, and CI.
