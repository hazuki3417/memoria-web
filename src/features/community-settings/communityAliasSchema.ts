import { z } from "zod"

/** Normalize the optional Alias form value to the application's nullable representation. */
export const communityAliasSchema = z.object({
  alias: z
    .string()
    .trim()
    .refine((value) => Array.from(value).length <= 100, {
      error: "100文字以内で入力してください。",
    })
    .transform((value) => value || null),
})
