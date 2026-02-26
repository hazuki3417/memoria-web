import "client-only";
import { z } from "zod";
import { sharedEnv, SharedEnvSchema } from "./shared";

const ClientEnvSchema = z
  .object({
    //NOTE: クライアント固有の環境変数を定義
  })
  .extend(SharedEnvSchema.shape);

export const clientEnv = ClientEnvSchema.parse({
  ...sharedEnv,
  // NOTE: クライアント固有の環境変数の値を設定
});
