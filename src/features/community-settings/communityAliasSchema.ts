import { z } from "zod"

/** Alias is optional; the API represents an empty alias with null. */
export const communityAliasSchema = z.object({
  alias: z
    .string()
    .trim()
    .refine((value) => Array.from(value).length <= 100, {
      error: "100文字以内で入力してください。",
    })
    .transform((value) => value || null),
})
