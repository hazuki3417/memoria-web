import { describe, expect, it } from "vitest"
import { personalPreferencesSchema } from "./personalPreferencesSchema"
import { defaultUserPreferences } from "./userPreferences"

describe("personalPreferencesSchema", () => {
  it("allows incomplete ColorInput drafts without saving them", () => {
    expect(
      personalPreferencesSchema.safeParse({
        ...defaultUserPreferences,
        accentDraft: "#12A",
      }).success,
    ).toBe(true)
  })

  it("rejects invalid persisted colors and enum values", () => {
    expect(
      personalPreferencesSchema.safeParse({
        ...defaultUserPreferences,
        accentDraft: "#12A",
        personalAccentColor: "#12A",
      }).success,
    ).toBe(false)
    expect(
      personalPreferencesSchema.safeParse({
        ...defaultUserPreferences,
        accentDraft: "#123456",
        dateFormat: "INVALID",
      }).success,
    ).toBe(false)
  })
})
