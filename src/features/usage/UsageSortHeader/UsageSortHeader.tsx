"use client"

import { SortHeader } from "@/ui/SortHeader"
import type { UsageSortDirection } from "../sortUsageFormats"

type UsageSortHeaderProps = {
  label: string
  direction: UsageSortDirection | null
  align: "left" | "right"
  disabled: boolean
  onSort: () => void
}

/** Usageの既存public component / Story contractを維持して共通UIへ委譲する。 */
export function UsageSortHeader(props: UsageSortHeaderProps) {
  return <SortHeader {...props} />
}
