import { z } from "zod"

/** Keep the original input intact while typing; trim only for persistence. */
export const profileSchema = z.object({
  nickname: z.string().trim().min(1, {
    error: "ニックネームを入力してください。",
  }),
})
