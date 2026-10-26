import type { SettingsUsageData } from "./usageTypes"

// Productionでは利用せず、Component Storyの共通入力だけを定義する。
export const sampleUsage: SettingsUsageData = {
  usedBytes: 1_240_000_000,
  limitBytes: 5_000_000_000,
  mediaCount: 1248,
  formatBreakdown: [
    { format: "JPEG", count: 900, sizeBytes: 900_000_000 },
    { format: "PNG", count: 200, sizeBytes: 200_000_000 },
    { format: "WebP", count: 100, sizeBytes: 100_000_000 },
    { format: "HEIC / HEIF", count: 48, sizeBytes: 40_000_000 },
  ],
}

export const zeroUsage: SettingsUsageData = {
  usedBytes: 0,
  limitBytes: 5_000_000_000,
  mediaCount: 0,
  formatBreakdown: [],
}
