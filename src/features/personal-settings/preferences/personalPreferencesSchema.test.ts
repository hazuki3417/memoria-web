import { describe, expect, it } from "vitest"
import { personalPreferencesSchema } from "./personalPreferencesSchema"
import { defaultPersonalPreferences } from "./personalPreferences"

describe("personalPreferencesSchema", () => {
  it("allows incomplete ColorInput drafts without saving them", () => {
    expect(
      personalPreferencesSchema.safeParse({
        ...defaultPersonalPreferences,
        accentDraft: "#12A",
      }).success,
    ).toBe(true)
  })

  it("rejects invalid persisted colors and enum values", () => {
    expect(
      personalPreferencesSchema.safeParse({
        ...defaultPersonalPreferences,
        accentDraft: "#12A",
        personalAccentColor: "#12A",
      }).success,
    ).toBe(false)
    expect(
      personalPreferencesSchema.safeParse({
        ...defaultPersonalPreferences,
        accentDraft: "#123456",
        dateFormat: "INVALID",
      }).success,
    ).toBe(false)
  })
})
