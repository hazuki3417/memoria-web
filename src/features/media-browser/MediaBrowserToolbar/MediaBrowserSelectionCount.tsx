"use client"

import { Badge } from "@mantine/core"

export function MediaBrowserSelectionCount({
  count,
}: { count: number }) {
  return <Badge size="lg" variant="light">{count}件選択</Badge>
}

