export type FileSizeUnit = "DECIMAL" | "BINARY"
export type FileSizeSuffix =
  | "B"
  | "KB"
  | "MB"
  | "GB"
  | "TB"
  | "KiB"
  | "MiB"
  | "GiB"
  | "TiB"

export type FormattedFileSize = { value: string; unit: FileSizeSuffix }

const DECIMAL_UNITS: readonly FileSizeSuffix[] = ["B", "KB", "MB", "GB", "TB"]
const BINARY_UNITS: readonly FileSizeSuffix[] = ["B", "KiB", "MiB", "GiB", "TiB"]

/** byte数から表示用の値と単位を導出し、空白やDOMなどの表示構成は担当しない。 */
export function formatFileSize(
  bytes: number,
  unit: FileSizeUnit = "DECIMAL",
): FormattedFileSize {
  const binary = unit === "BINARY"
  const base = binary ? 1024 : 1000
  const suffixes = binary ? BINARY_UNITS : DECIMAL_UNITS

  // 既存のUsage表示に合わせ、通常はGB/GiBを使用し、
  // 非ゼロの小さな容量は必要に応じて下位単位へ切り替える。
  let exponent = 3
  while (exponent > 0 && bytes > 0 && bytes / base ** exponent < 0.01) {
    exponent--
  }

  const value = bytes / base ** exponent
  let display: string

  if (exponent === 0) {
    display = String(value)
  } else if (value === 0) {
    display = "0"
  } else if (value < 1) {
    display = value.toFixed(2)
  } else {
    display = value.toFixed(2).replace(/\.?0+$/, "")
  }

  return { value: display, unit: suffixes[exponent] }
}
