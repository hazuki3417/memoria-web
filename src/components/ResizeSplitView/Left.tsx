import { PANEL_FIELDS } from "./constants"
import { Panel, PanelProps } from "./Panel"

export interface LeftProps extends Omit<PanelProps, "id"> {}

export const Left = (props: LeftProps) => {
  const { style, ...rest } = props
  return (
    <Panel
      id={PANEL_FIELDS.left}
      style={{ marginRight: "8px", ...style }}
      {...rest}
    />
  )
}
