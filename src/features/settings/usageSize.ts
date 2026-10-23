export type FileSizeUnit = "DECIMAL" | "BINARY"

export function usagePercent(bytes: number, limitBytes: number): number {
  if (limitBytes <= 0) return 0
  return Math.round((bytes / limitBytes) * 1000) / 10
}

/** Formats canonical byte values for Usage without parsing rounded labels. */
export function formatUsageBytes(bytes: number, unit: FileSizeUnit = "DECIMAL"): string {
  const base = unit === "BINARY" ? 1024 : 1000
  const suffixes = unit === "BINARY"
    ? ["B", "KiB", "MiB", "GiB", "TiB"]
    : ["B", "KB", "MB", "GB", "TB"]
  // Prefer GB/GiB for Usage rows and totals, retaining the previous layout
  // for regular sample values; use smaller units for tiny values.
  let exponent = 3
  while (exponent > 0 && bytes > 0 && bytes / base ** exponent < 0.01) {
    exponent--
  }
  const value = bytes / base ** exponent
  const display = exponent === 0
    ? String(value)
    : value === 0
      ? "0"
      : value < 1
        ? value.toFixed(2)
        : value.toFixed(2).replace(/\.?0+$/, "")
  return `${display} ${suffixes[exponent]}`
}
