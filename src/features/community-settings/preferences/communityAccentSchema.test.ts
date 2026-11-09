import { describe, expect, it } from "vitest"
import { communityAccentSchema } from "./communityAccentSchema"

describe("communityAccentSchema", () => {
  it("requires a complete HEX color before selection", () => {
    expect(
      communityAccentSchema.safeParse({ accentDraft: "#12ABcd" }).success,
    ).toBe(true)
    expect(
      communityAccentSchema.safeParse({ accentDraft: "#12A" }).success,
    ).toBe(false)
  })
})
