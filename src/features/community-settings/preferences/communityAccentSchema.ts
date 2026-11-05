import { z } from "zod"

/** The form may hold incomplete HEX drafts; only validated values are selected. */
export const communityAccentSchema = z.object({
  accentDraft: z.string().regex(/^#[0-9a-fA-F]{6}$/),
})
