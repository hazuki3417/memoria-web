"use client"

import { Panel as ResizablePanel } from "react-resizable-panels"
import type { SplitViewPaneProps } from "../types"

export function Pane({ minWidth, style, ...props }: SplitViewPaneProps) {
  return (
    <ResizablePanel
      minSize={minWidth}
      style={{ minWidth: 0, minHeight: 0, overflow: "hidden", ...style }}
      {...props}
    />
  )
}
