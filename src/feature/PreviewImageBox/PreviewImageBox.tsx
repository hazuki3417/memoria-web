import { Paper } from "@mantine/core"
import React, { memo } from "react"
import { Image } from "./Image"
import { Label } from "./Label"
import classes from "./PreviewImageBox.module.css"
import { RemoveButton } from "./RemoveButton"
import { SelectableCheckbox } from "./SelectableCheckbox"

export type PreviewImageBoxUi = {
  selected: boolean
  selectable: boolean
  supported: boolean
  valid?: "idle" | "accept" | "warning" | "reject"
}

export interface PreviewImageBoxProps {
  children: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLDivElement>
  ui: PreviewImageBoxUi
}

export const PreviewImageBox = (props: PreviewImageBoxProps) => {
  const { children, ui, ...rest } = props

  return (
    <Paper
      className={classes.box}
      {...rest}
      data-selected={ui.supported ? ui.selected : false}
      data-selectable={ui.supported ? ui.selectable : false}
      data-supported={ui.supported}
      data-valid={ui.supported ? ui.valid : undefined}
      data-testid="select-file"
    >
      {children}
    </Paper>
  )
}

PreviewImageBox.Image = memo(Image)
PreviewImageBox.Label = memo(Label)
PreviewImageBox.RemoveButton = memo(RemoveButton)
PreviewImageBox.SelectableCheckbox = memo(SelectableCheckbox)
