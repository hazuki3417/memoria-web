import { z } from "zod"

/** Preferencesの入力Schema。未完成HEXをDraftとして保持し、有効値のみ選択する。 */
export const communityPreferencesSchema = z.object({
  accentDraft: z.string().regex(/^#[0-9a-fA-F]{6}$/),
})
