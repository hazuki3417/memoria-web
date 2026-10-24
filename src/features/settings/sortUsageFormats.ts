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

/** 同じ列は 昇順 → 降順 → ソートなし。別の列は昇順から開始する。 */
export function nextUsageSort(current: UsageSort, key: UsageSortKey): UsageSort {
  if (current?.key !== key) return { key, direction: "asc" }
  if (current.direction === "asc") return { key, direction: "desc" }
  return null
}

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

    // 同値では0を返し、元の並び順を維持する（安定ソート）。
    return (sort.direction === "asc" ? 1 : -1) * result
  })
}
