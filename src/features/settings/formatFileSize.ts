export type FileSizeUnit = "DECIMAL" | "BINARY"
export type FileSizeSuffix = "B" | "KB" | "MB" | "GB" | "TB" | "KiB" | "MiB" | "GiB" | "TiB"
export type FormattedFileSize = { value: string; unit: FileSizeSuffix }

/** byte数から表示用の値と単位を導出し、空白やDOMなどの表示構成は担当しない。 */
export function formatFileSize(bytes: number, unit: FileSizeUnit = "DECIMAL"): FormattedFileSize {
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
  return { value: display, unit: suffixes[exponent] as FileSizeSuffix }
}
