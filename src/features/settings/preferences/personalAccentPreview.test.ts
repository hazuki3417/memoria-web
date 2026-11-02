import { describe, expect, it } from "vitest"
import { resolvePersonalAccent } from "./personalAccentPreview"
import type { PreferencesSessionSnapshot } from "./personalPreferencesSession"
import { defaultUserPreferences } from "./userPreferences"

const snapshot = (changes: Partial<PreferencesSessionSnapshot> = {}): PreferencesSessionSnapshot => ({
  confirmed: null,
  draftPatch: {},
  accentDraft: null,
  saveStatus: "idle",
  failure: null,
  inspected: false,
  observedMatches: false,
  discardRevision: 0,
  ...changes,
})

describe("Personal Accent visual preview", () => {
  it("previews a valid pending color immediately, before mutation confirmation", () => {
    expect(resolvePersonalAccent("#112233", snapshot({
      draftPatch: { personalAccentColor: "#aabbcc" },
      saveStatus: "pending",
    }))).toBe("#AABBCC")
  })

  it("keeps displaying confirmed color on rejected or unknown write without deleting draft", () => {
    for (const failure of ["unknown", "retryable", "blocked"] as const) {
      const state = snapshot({
        confirmed: { ...defaultUserPreferences, personalAccentColor: "#112233" },
        draftPatch: { personalAccentColor: "#AABBCC" },
        failure,
        saveStatus: "attention",
      })
      expect(resolvePersonalAccent("#445566", state)).toBe("#112233")
      expect(state.draftPatch.personalAccentColor).toBe("#AABBCC")
    }
  })

  it("does not preview an incomplete color draft", () => {
    expect(resolvePersonalAccent("#112233", snapshot({
      draftPatch: { personalAccentColor: "#123" },
      accentDraft: "#123",
    }))).toBe("#112233")
  })
})
