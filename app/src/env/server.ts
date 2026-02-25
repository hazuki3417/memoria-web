import "server-only"
import { z } from "zod"
import { sharedEnv, SharedEnvSchema } from "./shared"

const ServerEnvSchema = z
  .object({
    //NOTE: サーバー固有の環境変数を定義
    NODE_ENV: z.enum(["development", "production", "test"]),
    API_URI: z.string(),
    APP_BASE_URL: z.string(),
    AUTH0_DOMAIN: z.string(),
    AUTH0_CLIENT_ID: z.string(),
    AUTH0_CLIENT_SECRET: z.string(),
    AUTH0_SECRET: z.string(),
    AUTH0_SCOPE: z.string(),
    AUTH0_AUDIENCE: z.string(),
  })
  .extend(SharedEnvSchema.shape)

export const serverEnv = ServerEnvSchema.parse({
  ...sharedEnv,
  //NOTE: サーバー固有の環境変数の値を設定
  NODE_ENV: process.env.NODE_ENV ?? "development",
  API_URI: process.env.API_URI ?? "http://localhost:8080/graphql",
  APP_BASE_URL: process.env.APP_BASE_URL,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
  AUTH0_SECRET: process.env.AUTH0_SECRET,
  AUTH0_SCOPE: process.env.AUTH0_SCOPE,
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE,
})
