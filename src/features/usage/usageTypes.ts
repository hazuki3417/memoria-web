import type { UsageFormatItem } from "./sortUsageFormats"

export type UsageData = {
  usedBytes: number
  limitBytes: number
  mediaCount: number
  formatBreakdown?: UsageFormatItem[]
}

