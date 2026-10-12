# Auth0 login/logout integration (initial slice)

This is the first frontend authentication integration slice, **not** the completed Memoria login/registration flow.

## Required server environment

Configure the Auth0 Next.js SDK v4 server environment for the deployment:

- `AUTH0_DOMAIN` — Auth0 tenant domain
- `AUTH0_CLIENT_ID` — application client ID
- `AUTH0_CLIENT_SECRET` — confidential client secret (server only)
- `AUTH0_SECRET` — sufficiently strong session encryption secret (server only)
- `APP_BASE_URL` — deployed application origin
- `AUTH0_AUDIENCE` — Memoria API audience for access tokens
- `MEMORIA_GRAPHQL_URL` — server-reachable URL of the Memoria API GraphQL endpoint (for example, `http://localhost:8080/graphql`)

Configure the Auth0 application callback URL `{APP_BASE_URL}/auth/callback` and logout URL `{APP_BASE_URL}/login`. Never commit these secrets.

## Wired paths

- `/login` offers Auth0 Universal Login via `/auth/login`.
- The SDK's `proxy.ts` installs Auth0 login, callback, logout and session handling.
- Application and `/register` server layouts require an Auth0 session.
- The server-side `me` GraphQL query now checks the current Memoria User on every application/registration entry. ACTIVE users enter the application, unregistered users are routed to registration, and unavailable/error states fail closed. Tokens stay on the server.
- The account menu and registration exit trigger `/auth/logout`.

## Known gaps (must be completed before production)

- The `me` query is now connected at the route gate, but end-to-end testing against a configured API and per-resource Community authorization are still outstanding. Auth0 session alone is **not** sufficient for application authorization.
- Implement `registerUser` mutation instead of the current preview-only registration.
- Implement secure allowlisted return destinations and session recovery, including Community membership checks.
- Connect authenticated API calls to the server-side Access Token (BFF), without exposing tokens in client state.
- Verify logout redirect/session invalidation, Auth0 configuration, browser flows, tests, and security behavior in a configured environment.

Source of truth: `memoria-design/content/user/authentication-authorization.mdx` and `content/design-system/patterns/authentication-return-session-recovery.mdx`.
