import type { SettingsUsageData } from "./usageTypes"

// Int64はAPIから10進数文字列として届く。表示用numberへ変換する前に精度を検証する。
type UsageInt64 = string
type UsageProjection = {
  mediaCount: number
  storage: { usedBytes: UsageInt64; effectiveLimitBytes: UsageInt64 }
  formatBreakdown: Array<{
    format: string
    mediaCount: number
    usedBytes: UsageInt64
  }>
}

function safeBytes(value: UsageInt64): number {
  if (!/^(0|[1-9][0-9]*)$/.test(value)) {
    throw new Error("Usageのbyte数が不正です")
  }
  const result = Number(value)
  if (!Number.isSafeInteger(result)) {
    throw new Error("Usageのbyte数がJavaScriptの安全な整数範囲を超えています")
  }
  return result
}

const formatLabels = {
  JPEG: "JPEG",
  PNG: "PNG",
  WEBP: "WebP",
  HEIF: "HEIC / HEIF",
} as const

export function mapUsageProjection(usage: UsageProjection): SettingsUsageData {
  if (!Number.isSafeInteger(usage.mediaCount) || usage.mediaCount < 0) {
    throw new Error("Usageの登録件数が不正です")
  }
  const usedBytes = safeBytes(usage.storage.usedBytes)
  const limitBytes = safeBytes(usage.storage.effectiveLimitBytes)
  const formatBreakdown = usage.formatBreakdown.map((item) => {
    if (!Number.isSafeInteger(item.mediaCount) || item.mediaCount < 0) {
      throw new Error("形式別の登録件数が不正です")
    }
    const format = formatLabels[item.format as keyof typeof formatLabels]
    if (!format) throw new Error("未対応の形式が含まれています")
    return { format, count: item.mediaCount, sizeBytes: safeBytes(item.usedBytes) }
  })
  return {
    usedBytes,
    limitBytes,
    mediaCount,
    // Backendは0件でも全形式を返すが、既存UIでは確定0件をEmptyとして表示する。
    formatBreakdown: usage.mediaCount === 0 ? [] : formatBreakdown,
  }
}

export const emptyUsage: SettingsUsageData = {
  usedBytes: 0,
  limitBytes: 0,
  mediaCount: 0,
  formatBreakdown: [],
}
