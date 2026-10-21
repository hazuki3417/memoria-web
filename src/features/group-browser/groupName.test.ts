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


  it("rejects forbidden Cc before trim, whether leading, internal, or trailing (GB-038)", () => {
    for (const control of ["\n", "\t", "\u0000", "\u0001", "\u007f"]) {
      expect(validGroupName(control + "Group")).toBe(false)
      expect(validGroupName("Group" + control)).toBe(false)
      expect(validGroupName("Gr" + control + "oup")).toBe(false)
    }
  })

  it("rejects Unicode line and paragraph separators even when trim would remove them (GB-038)", () => {
    for (const separator of ["\u2028", "\u2029"]) {
      expect(validGroupName(separator + "Group")).toBe(false)
      expect(validGroupName("Group" + separator)).toBe(false)
      expect(validGroupName("Gr" + separator + "oup")).toBe(false)
    }
  })

  it("preserves permitted whitespace and format characters (GB-038)", () => {
    expect(validGroupName("  Group  ")).toBe(true)
    expect(validGroupName("Group Name")).toBe(true)
    expect(validGroupName("👨‍👩‍👧‍👦")).toBe(true)
    expect(validGroupName("e\u0301")).toBe(true)
  })

  it("does not normalize case, width or permitted interior spacing (GB-040)", () => {
    for (const value of ["Group", "group", "Ｇｒｏｕｐ", "Group Name", "Group  Name"]) {
      expect(validGroupName(value)).toBe(true)
    }
    expect(countGroupNameGraphemes("e\\u0301")).toBe(1)
    expect(countGroupNameGraphemes("é")).toBe(1)
  })

})
