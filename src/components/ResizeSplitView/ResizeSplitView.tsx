import { Group, GroupProps } from "react-resizable-panels"
import { Panel } from "./Panel"
import { Separator } from "./Separator"

export interface ResizeSplitViewProps extends Omit<GroupProps, "orientation"> {}

export const ResizeSplitView = (props: ResizeSplitViewProps) => {
  const { ...rest } = props

  return <Group orientation="horizontal" {...rest} />
}

ResizeSplitView.displayName = "ResizeSplitView"
ResizeSplitView.Separator = Separator
ResizeSplitView.Panel = Panel
