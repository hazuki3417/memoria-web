import { z } from "zod"

export const BooleanFromString = z.enum(["true", "false"])

export const SharedEnvSchema = z.object({
  //NOTE: サーバー・クライアント共有の環境変数を定義
  USE_MSW: BooleanFromString,
})

export const sharedEnv = SharedEnvSchema.parse({
  /**
   * NOTE: サーバー・クライアント共有の環境変数を定義
   *       NEXT_PUBLICの接頭辞を持たない環境変数はここで呼び出さないでください。
   *       NEXT_PUBLICがついている = サーバー・クライアントどちらでも利用可能な環境変数
   */
  USE_MSW: "true",
})
