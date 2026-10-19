import { describe, expect, it } from "vitest"
import { countGroupNameGraphemes, validGroupName } from "./groupName"

describe("Group name grapheme validation", () => {
  it("treats combining marks as one perceived character", () => {
    expect(countGroupNameGraphemes("e\u0301")).toBe(1)
    expect(validGroupName("e\u0301".repeat(100))).toBe(true)
    expect(validGroupName("e\u0301".repeat(101))).toBe(false)
  })
  it("rejects an empty or whitespace-only name", () => {
    expect(validGroupName("   ")).toBe(false)
  })
  it("supports Japanese Group names", () => {
    expect(validGroupName("卒業式")).toBe(true)
  })
})
