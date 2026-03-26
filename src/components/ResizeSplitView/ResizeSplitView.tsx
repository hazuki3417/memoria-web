import { Group, GroupProps, Layout } from "react-resizable-panels"
import { PANEL_FIELDS } from "./constants"
import { Left } from "./Left"
import { Right } from "./Right"
import { Separator } from "./Separator"
import { ResizeSplitViewLayout } from "./types"

export interface ResizeSplitViewProps
  extends Omit<
    GroupProps,
    "orientation" | "defaultLayout" | "onLayoutChanged"
  > {
  defaultLayout: {
    [PANEL_FIELDS.left]: number
    [PANEL_FIELDS.right]: number
  }
  onLayoutChanged?: (layout: ResizeSplitViewLayout) => void
}

export const ResizeSplitView = (props: ResizeSplitViewProps) => {
  const { onLayoutChanged, ...rest } = props

  const handleLayoutChanged = (layout: Layout) => {
    onLayoutChanged?.({
      left: layout[PANEL_FIELDS.left],
      right: layout[PANEL_FIELDS.right],
    })
  }

  return (
    <Group
      orientation="horizontal"
      onLayoutChanged={handleLayoutChanged}
      {...rest}
    />
  )
}

ResizeSplitView.displayName = "ResizeSplitView"
ResizeSplitView.Separator = Separator
ResizeSplitView.Left = Left
ResizeSplitView.Right = Right
