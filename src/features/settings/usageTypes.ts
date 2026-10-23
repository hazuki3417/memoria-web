import type { UsageFormatItem } from "./sortUsageFormats"

export type SettingsUsageData = {
  usedBytes: number
  limitBytes: number
  mediaCount: number
  formatBreakdown?: UsageFormatItem[]
}

export type UsageStatus = "ready" | "loading" | "error"
