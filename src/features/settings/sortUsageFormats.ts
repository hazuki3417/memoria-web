export type UsageFormatItem = {
  format: string
  count: number
  sizeBytes: number
}

export type UsageSortKey = "format" | "count" | "size" | "percent"
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
    const result =
      sort.key === "format"
        ? collator.compare(a.format, b.format)
        : sort.key === "count"
          ? a.count - b.count
          : sort.key === "size"
            ? a.sizeBytes - b.sizeBytes
            : a.sizeBytes - b.sizeBytes

    return (
      (sort.direction === "asc" ? 1 : -1) *
      (result || collator.compare(a.format, b.format))
    )
  })
}
