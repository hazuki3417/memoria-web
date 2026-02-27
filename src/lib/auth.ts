import { serverEnv } from "@/env/server"
import { Auth0Client } from "@auth0/nextjs-auth0/server"

export const auth = new Auth0Client({
  appBaseUrl: serverEnv.APP_BASE_URL,
  domain: serverEnv.AUTH0_DOMAIN,
  clientId: serverEnv.AUTH0_CLIENT_ID,
  clientSecret: serverEnv.AUTH0_CLIENT_SECRET,
  secret: serverEnv.AUTH0_SECRET,

  authorizationParameters: {
    scope: serverEnv.AUTH0_SCOPE,
    audience: serverEnv.AUTH0_AUDIENCE,
  },
})
