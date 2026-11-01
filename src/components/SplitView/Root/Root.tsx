"use client"

import { Group as ResizableGroup } from "react-resizable-panels"
import type { SplitViewRootProps } from "../types"

export function Root({ style, ...props }: SplitViewRootProps) {
  return (
    <ResizableGroup
      orientation="horizontal"
      style={{ minWidth: 0, minHeight: 0, ...style }}
      {...props}
    />
  )
}
