import { describe, expect, it } from "vitest"
import { preferencesSchema } from "./preferencesSchema"
import { defaultUserPreferences } from "./userPreferences"

describe("preferencesSchema", () => {
  it("allows incomplete ColorInput drafts without saving them", () => {
    expect(preferencesSchema.safeParse({
      ...defaultUserPreferences,
      accentDraft: "#12A",
    }).success).toBe(true)
  })

  it("rejects invalid persisted colors and enum values", () => {
    expect(preferencesSchema.safeParse({
      ...defaultUserPreferences,
      accentDraft: "#12A",
      personalAccentColor: "#12A",
    }).success).toBe(false)
    expect(preferencesSchema.safeParse({
      ...defaultUserPreferences,
      accentDraft: "#123456",
      dateFormat: "INVALID",
    }).success).toBe(false)
  })
})
