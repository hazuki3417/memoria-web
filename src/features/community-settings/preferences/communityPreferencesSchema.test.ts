import { describe, expect, it } from "vitest"
import { communityPreferencesSchema } from "./communityPreferencesSchema"

describe("communityPreferencesSchema", () => {
  it("requires a complete HEX color before selection", () => {
    expect(
      communityPreferencesSchema.safeParse({ accentDraft: "#12ABcd" }).success,
    ).toBe(true)
    expect(
      communityPreferencesSchema.safeParse({ accentDraft: "#12A" }).success,
    ).toBe(false)
  })
})
