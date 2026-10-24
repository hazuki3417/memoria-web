import { describe, expect, it } from "vitest"
import { defaultUsageSort, nextUsageSort, sortUsageFormats, type UsageFormatItem } from "./sortUsageFormats"

const items: UsageFormatItem[] = [
  { format: "JPEG", count: 900, sizeBytes: 900_000_000 },
  { format: "PNG", count: 200, sizeBytes: 200_000_000 },
  { format: "WebP", count: 100, sizeBytes: 100_000_000 },
  { format: "HEIC / HEIF", count: 48, sizeBytes: 40_000_000 },
]
const names = (rows: UsageFormatItem[]) => rows.map((row) => row.format)

describe("sortUsageFormats", () => {
  it("keeps the original order when no sort is selected, without mutating input", () => {
    const input = [...items]
    const output = sortUsageFormats(input, null)
    expect(names(output)).toEqual(names(items))
    expect(output).not.toBe(input)
    expect(input).toEqual(items)
  })

  it.each([
    ["format", "asc", ["HEIC / HEIF", "JPEG", "PNG", "WebP"]],
    ["format", "desc", ["WebP", "PNG", "JPEG", "HEIC / HEIF"]],
    ["count", "asc", ["HEIC / HEIF", "WebP", "PNG", "JPEG"]],
    ["count", "desc", ["JPEG", "PNG", "WebP", "HEIC / HEIF"]],
    ["size", "asc", ["HEIC / HEIF", "WebP", "PNG", "JPEG"]],
    ["size", "desc", ["JPEG", "PNG", "WebP", "HEIC / HEIF"]],
  ] as const)("sorts %s %s from canonical data", (key, direction, expected) => {
    expect(names(sortUsageFormats(items, { key, direction }))).toEqual(expected)
  })

  it("uses precise bytes for sizes which round to the same display label", () => {
    const near = [
      { format: "C", count: 1, sizeBytes: 1_200_000_001 },
      { format: "A", count: 1, sizeBytes: 1_200_000_000 },
      { format: "B", count: 1, sizeBytes: 800_000_000 },
    ]
    expect(names(sortUsageFormats(near, { key: "size", direction: "asc" }))).toEqual(["B", "A", "C"])
  })

  it("preserves the incoming relative order of equal values in both directions", () => {
    const tied = [
      { format: "PNG", count: 5, sizeBytes: 1_000_000 },
      { format: "JPEG", count: 5, sizeBytes: 1_000_000 },
      { format: "WebP", count: 3, sizeBytes: 500_000 },
    ]
    expect(names(sortUsageFormats(tied, { key: "count", direction: "asc" }))).toEqual(["WebP", "JPEG", "PNG"])
    expect(names(sortUsageFormats(tied, { key: "count", direction: "desc" }))).toEqual(["JPEG", "PNG", "WebP"])
    expect(names(sortUsageFormats(tied, { key: "size", direction: "asc" }))).toEqual(["WebP", "PNG", "JPEG"])
    expect(names(sortUsageFormats(tied, { key: "size", direction: "desc" }))).toEqual(["PNG", "JPEG", "WebP"])
  })

  it("keeps the original format order when counts and sizes are all zero", () => {
    const zero = items.map((item) => ({ ...item, count: 0, sizeBytes: 0 }))
    for (const key of ["count", "size"] as const) {
      for (const direction of ["asc", "desc"] as const) {
        expect(names(sortUsageFormats(zero, { key, direction }))).toEqual(names(zero))
      }
    }
  })

  it("cycles asc, desc, none and starts another column at asc", () => {
    const asc = nextUsageSort(null, "count")
    expect(asc).toEqual({ key: "count", direction: "asc" })
    const desc = nextUsageSort(asc, "count")
    expect(desc).toEqual({ key: "count", direction: "desc" })
    expect(nextUsageSort(desc, "count")).toBeNull()
    expect(nextUsageSort(desc, "size")).toEqual({ key: "size", direction: "asc" })
  })

  it("uses canonical format order for unsorted and tied values regardless of API order", () => {
    const shuffled = [items[3], items[2], items[0], items[1]]
    expect(names(sortUsageFormats(shuffled, null))).toEqual(names(items))
    const tied = shuffled.map((item) => ({ ...item, sizeBytes: 0 }))
    expect(names(sortUsageFormats(tied, defaultUsageSort))).toEqual(names(items))
    expect(names(sortUsageFormats(tied, { key: "size", direction: "asc" }))).toEqual(names(items))
  })

  it("defaults to size descending and returns to no sort on first same-column click", () => {
    expect(defaultUsageSort).toEqual({ key: "size", direction: "desc" })
    expect(nextUsageSort(defaultUsageSort, "size")).toBeNull()
    expect(nextUsageSort(null, "size")).toEqual({ key: "size", direction: "asc" })
  })

  it("handles an empty breakdown", () => {
    expect(sortUsageFormats([], null)).toEqual([])
    expect(sortUsageFormats([], { key: "size", direction: "asc" })).toEqual([])
  })
})
