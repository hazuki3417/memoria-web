# GraphQL schema synchronization and code generation

Source of truth: `memoria-api/schemas/graphql/*.graphql` on the integration branch. The committed `src/infrastructure/graphql/schema.graphql` is a **client-side snapshot**, not an independent schema definition. The GraphQL Query/Mutation root types are explicit in this snapshot because the API SDL declares extensions to gqlgen's built-in roots.

## Workflow

1. Run `memoria-api` locally with the matching backend schema.
2. From the web repository, inside Devbox, run `GRAPHQL_SCHEMA_URL=http://localhost:8080/graphql npm run graphql:codegen:api` **only if the endpoint permits introspection**. This validates operations against the live schema and generates TypeScript types.
3. Run `npm run graphql:codegen` to generate types from the committed snapshot without requiring a running backend. Commit the snapshot and generated types together after checking differences against the API's source SDL.
4. In CI, run `npm run graphql:codegen` and fail when generated artifacts differ from the committed versions. This CI integration is not yet wired.
5. Never copy production credentials or tokens into source files. Introspection of the protected `/graphql` endpoint requires an authenticated development setup; do not bypass API authentication.

Operations: `src/infrastructure/graphql/operations/user.graphql`. Generated output: `src/infrastructure/graphql/generated.ts`.

## Current limitations

- Codegen CLI and type checking have not yet been run in this branch. Generated artifacts are therefore not yet committed, and the server adapter currently uses local response types.
- The snapshot is manually constructed from the API SDL on 2026-10-12; automate extraction/synchronization and add a CI diff check before treating this as production-ready.
- The GraphQL adapter sends explicit `operationName` for tracing. The operation strings in the adapter must be replaced with generated Documents after generation is verified.
- Registration must be tested end-to-end with Auth0, Postgres and the running API.
