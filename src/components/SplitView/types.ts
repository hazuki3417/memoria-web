import type { ComponentProps } from "react"
import { Group as ResizableGroup, Panel as ResizablePanel, Separator as ResizableSeparator } from "react-resizable-panels"

export type SplitViewRootProps = ComponentProps<typeof ResizableGroup>
export type SplitViewPaneProps = Omit<
  ComponentProps<typeof ResizablePanel>,
  "minSize"
> & {
  minWidth?: number
}
export type SplitViewSeparatorProps = ComponentProps<typeof ResizableSeparator>

