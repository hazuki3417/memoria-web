import { useState, type ComponentProps } from "react"
import { UsageFormatBreakdownSection } from "../UsageFormatBreakdownSection"
import {
  defaultUsageSort,
  nextUsageSort,
  type UsageSort,
  type UsageSortKey,
} from "../../sortUsageFormats"

export function SortableBreakdownStory(
  props: Omit<
    ComponentProps<typeof UsageFormatBreakdownSection>,
    "sort" | "onSort"
  >,
) {
  const [sort, setSort] = useState<UsageSort>(defaultUsageSort)
  const toggleSort = (key: UsageSortKey) => {
    setSort((current) => nextUsageSort(current, key))
  }
  return (
    <UsageFormatBreakdownSection {...props} sort={sort} onSort={toggleSort} />
  )
}
