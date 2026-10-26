import { describe, expect, it } from "vitest"
import { filterVisibleGroups } from "./groupSearch"

const items = [
  { id: "a", name: "Alpha" },
  { id: "b", name: "alpha" },
  { id: "c", name: "アルバム" },
]

describe("filterVisibleGroups", () => {
  it("returns the same list in the original order without an applied query", () => {
    expect(filterVisibleGroups(items, "   ", true)).toBe(items)
  })
  it("keeps external data search case-sensitive", () => {
    expect(filterVisibleGroups(items, "alpha", true)).toEqual([items[1]])
  })
  it("keeps preview fixture search case-insensitive", () => {
    expect(filterVisibleGroups(items, "alpha", false)).toEqual([
      items[0],
      items[1],
    ])
  })
  it("trims the applied query without changing the original item order", () => {
    expect(filterVisibleGroups(items, " アル ", true)).toEqual([items[2]])
  })
})
