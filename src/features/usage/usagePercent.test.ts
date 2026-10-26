import { describe, expect, it } from "vitest"
import { usagePercent } from "./usagePercent"

describe("Usageの容量割合", () => {
  it("byte数と上限から割合を算出する", () => {
    expect(usagePercent(1_240_000_000, 5_000_000_000)).toBe(24.8)
    expect(usagePercent(40_000_000, 5_000_000_000)).toBe(0.8)
    expect(usagePercent(0, 5_000_000_000)).toBe(0)
    expect(usagePercent(5_000_000_000, 5_000_000_000)).toBe(100)
    expect(usagePercent(0, 0)).toBe(0)
  })
})
