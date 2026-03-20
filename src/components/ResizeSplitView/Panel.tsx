import { Panel as Base, PanelProps as BaseProps } from "react-resizable-panels"

export interface PanelProps extends BaseProps {
  visible?: boolean
}

export const Panel = (props: PanelProps) => {
  const { visible = true, style, ...rest } = props

  return (
    <Base
      style={{
        visibility: visible ? "visible" : "hidden",
        overflow: "hidden",
        ...style,
      }}
      {...rest}
    />
  )
}

Panel.displayName = "ResizeSplitView.Panel"
