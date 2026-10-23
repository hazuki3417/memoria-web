"use client"

import { formatFileSize, type FileSizeUnit } from "./formatFileSize"

/** Usageで採用済みの「値 + 半角スペース + 単位」を表示する。 */
export function UsageFileSize({
  bytes,
  fileSizeUnit,
}: {
  bytes: number
  fileSizeUnit: FileSizeUnit
}) {
  const { value, unit } = formatFileSize(bytes, fileSizeUnit)
  return <>{value} {unit}</>
}
