import { z } from "zod"

/** Community name is required; the submitted value is trimmed. */
export const communityNameSchema = z.object({
  name: z.string().trim().min(1, {
    error: "Community名を入力してください",
  }),
})
