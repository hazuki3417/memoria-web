import { describe, expect, it } from "vitest"
import { communityAliasSchema } from "./communityAliasSchema"

describe("communityAliasSchema", () => {
  it("translates a cleared alias to null", () => {
    expect(communityAliasSchema.parse({ alias: "  " }).alias).toBeNull()
    expect(communityAliasSchema.parse({ alias: " Alias " }).alias).toBe("Alias")
  })

  it("validates aliases by Unicode code points", () => {
    const symbol = String.fromCodePoint(0x1f600)
    expect(
      communityAliasSchema.safeParse({ alias: symbol.repeat(100) }).success,
    ).toBe(true)
    expect(
      communityAliasSchema.safeParse({ alias: symbol.repeat(101) }).success,
    ).toBe(false)
  })
})
