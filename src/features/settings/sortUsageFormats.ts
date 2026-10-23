export type UsageFormatItem = {
  format: string
  count: number
  sizeLabel: string
  capacityPercent: number
}

export type UsageSortKey = "format" | "count" | "size" | "percent"
export type UsageSortDirection = "asc" | "desc"
export type UsageSort = {
  key: UsageSortKey
  direction: UsageSortDirection
} | null

const sizeMultipliers: Record<string, number> = {
  B: 1,
  KB: 1024,
  MB: 1024 ** 2,
  GB: 1024 ** 3,
  TB: 1024 ** 4,
  PB: 1024 ** 5,
}

function parseSize(label: string): number {
  const match = label.trim().match(/^([\d,.]+)\s*(B|KB|MB|GB|TB|PB)$/i)
  if (!match) return 0
  return (
    Number(match[1].replace(/,/g, "")) * sizeMultipliers[match[2].toUpperCase()]
  )
}

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
            ? parseSize(a.sizeLabel) - parseSize(b.sizeLabel)
            : a.capacityPercent - b.capacityPercent

    return (
      (sort.direction === "asc" ? 1 : -1) *
      (result || collator.compare(a.format, b.format))
    )
  })
}
