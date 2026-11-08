import { z } from "zod"

/** Stored settings are validated independently of the incomplete color draft. */
export const preferencesSchema = z.object({
  personalAccentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  dateFormat: z.enum(["YYYY_MM_DD", "MM_DD_YYYY", "DD_MM_YYYY"]),
  fileSizeUnit: z.enum(["DECIMAL", "BINARY"]),
  mediaThumbnailSize: z.enum(["SMALL", "MEDIUM", "LARGE"]),
  mediaDetailNavigationWrap: z.boolean(),
  mediaDetailInitialInfoWide: z.boolean(),
  mediaDetailInitialInfoMedium: z.boolean(),
  accentDraft: z.string(),
})
