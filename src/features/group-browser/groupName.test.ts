import { describe, expect, it } from "vitest"
import { canEnterGroupName, countGroupNameGraphemes, validGroupName } from "./groupName"

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

  it("accepts exactly 100 graphemes and rejects 101 (GB-037)", () => {
    for (const character of ["あ", "e\u0301", "👨‍👩‍👧‍👦"]) {
      expect(canEnterGroupName(character.repeat(100))).toBe(true)
      expect(canEnterGroupName(character.repeat(101))).toBe(false)
      expect(validGroupName(character.repeat(100))).toBe(true)
      expect(validGroupName(character.repeat(101))).toBe(false)
    }
  })

  it("distinguishes input length from trimmed name validity (GB-036)", () => {
    expect(canEnterGroupName("")).toBe(true)
    expect(canEnterGroupName(" ".repeat(101))).toBe(false)
    expect(validGroupName("")).toBe(false)
    expect(validGroupName("　\t ")).toBe(false)
    expect(validGroupName("  卒業式  ")).toBe(true)
    expect(validGroupName(" ".repeat(50) + "卒業式" + " ".repeat(50))).toBe(true)
  })

  it("counts joined emoji as one grapheme rather than code points", () => {
    expect(countGroupNameGraphemes("👨‍👩‍👧‍👦")).toBe(1)
    expect(countGroupNameGraphemes("🇯🇵")).toBe(1)
  })

})
