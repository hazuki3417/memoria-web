import { describe, expect, it } from "vitest"
import { communityAliasSchema } from "./communityAliasSchema"
import { communityNameSchema } from "./communityNameSchema"
import { communityAccentSchema } from "./communityAccentSchema"

describe("Community Settings schemas", () => {
  it("translates a cleared alias to null", () => {
    expect(communityAliasSchema.parse({ alias: "  " }).alias).toBeNull()
    expect(communityAliasSchema.parse({ alias: " Alias " }).alias).toBe("Alias")
  })

  it("validates aliases by Unicode code points", () => {
    const symbol = String.fromCodePoint(0x1f600)
    expect(communityAliasSchema.safeParse({ alias: symbol.repeat(100) }).success).toBe(true)
    expect(communityAliasSchema.safeParse({ alias: symbol.repeat(101) }).success).toBe(false)
  })

  it("trims Community names and requires a nonblank value", () => {
    expect(communityNameSchema.parse({ name: " Name " }).name).toBe("Name")
    expect(communityNameSchema.safeParse({ name: " " }).success).toBe(false)
  })

  it("requires a complete HEX color before selection", () => {
    expect(communityAccentSchema.safeParse({ accentDraft: "#12ABcd" }).success).toBe(true)
    expect(communityAccentSchema.safeParse({ accentDraft: "#12A" }).success).toBe(false)
  })
})
