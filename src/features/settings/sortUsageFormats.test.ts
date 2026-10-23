import { describe, expect, it } from "vitest"
import { sortUsageFormats, type UsageFormatItem } from "./sortUsageFormats"

const items: UsageFormatItem[] = [
  { format: "JPEG", count: 900, sizeLabel: "0.90 GB", capacityPercent: 18 },
  { format: "PNG", count: 200, sizeLabel: "0.20 GB", capacityPercent: 4 },
  { format: "WebP", count: 100, sizeLabel: "0.10 GB", capacityPercent: 2 },
  { format: "HEIC / HEIF", count: 48, sizeLabel: "0.04 GB", capacityPercent: 0.8 },
]

const names = (rows: UsageFormatItem[]) => rows.map((row) => row.format)

describe("sortUsageFormats", () => {
  it("preserves the API order with no sort and never mutates the input", () => {
    const source = [...items]
    const result = sortUsageFormats(source, null)
    expect(names(result)).toEqual(names(items))
    expect(result).not.toBe(source)
    expect(source).toEqual(items)
  })

  it.each([
    ["format", "asc", ["HEIC / HEIF", "JPEG", "PNG", "WebP"]],
    ["format", "desc", ["WebP", "PNG", "JPEG", "HEIC / HEIF"]],
    ["count", "asc", ["HEIC / HEIF", "WebP", "PNG", "JPEG"]],
    ["count", "desc", ["JPEG", "PNG", "WebP", "HEIC / HEIF"]],
    ["size", "asc", ["HEIC / HEIF", "WebP", "PNG", "JPEG"]],
    ["size", "desc", ["JPEG", "PNG", "WebP", "HEIC / HEIF"]],
    ["percent", "asc", ["HEIC / HEIF", "WebP", "PNG", "JPEG"]],
    ["percent", "desc", ["JPEG", "PNG", "WebP", "HEIC / HEIF"]],
  ] as const)("sorts by %s %s", (key, direction, expected) => {
    expect(names(sortUsageFormats(items, { key, direction }))).toEqual(expected)
  })

  it("compares sizes numerically across units instead of lexically", () => {
    const mixed = [
      { format: "C", count: 1, sizeLabel: "1.2 GB", capacityPercent: 1 },
      { format: "A", count: 1, sizeLabel: "800 MB", capacityPercent: 1 },
      { format: "B", count: 1, sizeLabel: "1,024 KB", capacityPercent: 1 },
    ]
    expect(names(sortUsageFormats(mixed, { key: "size", direction: "asc" }))).toEqual([
      "B",
      "A",
      "C",
    ])
  })

  it("uses the format name as a tie-breaker with the same sort direction", () => {
    const tied = [
      { format: "PNG", count: 5, sizeLabel: "1 MB", capacityPercent: 1 },
      { format: "JPEG", count: 5, sizeLabel: "1 MB", capacityPercent: 1 },
    ]
    expect(names(sortUsageFormats(tied, { key: "count", direction: "asc" }))).toEqual([
      "JPEG",
      "PNG",
    ])
    expect(names(sortUsageFormats(tied, { key: "count", direction: "desc" }))).toEqual([
      "PNG",
      "JPEG",
    ])
  })

  it("handles an empty breakdown without creating placeholder data", () => {
    expect(sortUsageFormats([], null)).toEqual([])
    expect(sortUsageFormats([], { key: "size", direction: "asc" })).toEqual([])
  })
})
