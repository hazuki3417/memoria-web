import { PANEL_FIELDS } from "./constants"
import { Panel, PanelProps } from "./Panel"

export interface RightProps extends Omit<PanelProps, "id"> {}

export const Right = (props: RightProps) => {
  const { style, ...rest } = props
  return (
    <Panel
      id={PANEL_FIELDS.right}
      style={{ marginLeft: "8px", ...style }}
      {...rest}
    />
  )
}
