import { Auth0Client } from "@auth0/nextjs-auth0/server"

// The SDK stores the browser session in an encrypted, HttpOnly cookie.
// Secrets and API access tokens must never be exposed to client components.
export const auth0 = new Auth0Client({
  authorizationParameters: {
    audience: process.env.AUTH0_AUDIENCE,
    scope: "openid profile",
  },
})
