export type UsageFormatItem = {
  format: string
  count: number
  sizeBytes: number
}

export type UsageSortKey = "format" | "count" | "size"
export type UsageSortDirection = "asc" | "desc"
export type UsageSort = {
  key: UsageSortKey
  direction: UsageSortDirection
} | null

export function sortUsageFormats(
  items: readonly UsageFormatItem[],
  sort: UsageSort,
): UsageFormatItem[] {
  const sorted = [...items]
  if (!sort) return sorted

  const collator = new Intl.Collator("ja-JP", { numeric: true })
  return sorted.sort((a, b) => {
    let result: number
    switch (sort.key) {
      case "format":
        result = collator.compare(a.format, b.format)
        break
      case "count":
        result = a.count - b.count
        break
      case "size":
        // 同一上限に対する割合もsizeBytesと同じ順序になる。
        result = a.sizeBytes - b.sizeBytes
        break
    }

    return (
      (sort.direction === "asc" ? 1 : -1) *
      (result || collator.compare(a.format, b.format))
    )
  })
}
