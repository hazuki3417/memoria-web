import { describe, expect, it } from "vitest"
import { profileSchema } from "./profileSchema"

describe("profileSchema", () => {
  it("trims input and rejects blank values", () => {
    expect(profileSchema.parse({ nickname: " Example " }).nickname).toBe(
      "Example",
    )
    expect(profileSchema.safeParse({ nickname: "   " }).success).toBe(false)
  })
})
