import { describe, expect, it } from "vitest"
import { formatUsageBytes, usagePercent } from "./usageSize"

describe("Usageのbyte表示変換", () => {
  it("uses decimal units by default", () => {
    expect(formatUsageBytes(1_240_000_000)).toBe("1.24 GB")
    expect(formatUsageBytes(900_000_000)).toBe("0.90 GB")
    expect(formatUsageBytes(5_000_000_000)).toBe("5 GB")
    expect(formatUsageBytes(0)).toBe("0 GB")
  })

  it("uses binary factors and explicit binary units", () => {
    expect(formatUsageBytes(1_073_741_824, "BINARY")).toBe("1 GiB")
    expect(formatUsageBytes(5_000_000_000, "BINARY")).toBe("4.66 GiB")
    expect(formatUsageBytes(0, "BINARY")).toBe("0 GiB")
  })

  it("does not render tiny nonzero sizes as zero", () => {
    expect(formatUsageBytes(1000)).toBe("1 KB")
    expect(formatUsageBytes(1024, "BINARY")).toBe("1 KiB")
  })

  it("derives capacity percentages from canonical bytes", () => {
    expect(usagePercent(1_240_000_000, 5_000_000_000)).toBe(24.8)
    expect(usagePercent(40_000_000, 5_000_000_000)).toBe(0.8)
    expect(usagePercent(0, 5_000_000_000)).toBe(0)
    expect(usagePercent(5_000_000_000, 5_000_000_000)).toBe(100)
    expect(usagePercent(0, 0)).toBe(0)
  })
})
