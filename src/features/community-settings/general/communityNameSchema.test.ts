import { describe, expect, it } from "vitest"
import { communityNameSchema } from "../communityNameSchema"

describe("communityNameSchema", () => {
  it("trims Community names and requires a nonblank value", () => {
    expect(communityNameSchema.parse({ name: " Name " }).name).toBe("Name")
    expect(communityNameSchema.safeParse({ name: " " }).success).toBe(false)
  })
})
