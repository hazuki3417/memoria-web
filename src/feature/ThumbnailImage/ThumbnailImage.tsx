import { Box } from "@mantine/core"
import React, { memo } from "react"
import { Image } from "./Image"
import { Label } from "./Label"
import { RemoveButton } from "./RemoveButton"
import { SelectableCheckbox } from "./SelectableCheckbox"
import classes from "./ThumbnailImage.module.css"

export type ThumbnailImageUi = {
  outline?: boolean
  selected?: boolean
  selectable?: boolean
  supported?: boolean
  valid?: "idle" | "accept" | "warning" | "reject"
}

export interface ThumbnailImageProps {
  children: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLDivElement>
  ui?: ThumbnailImageUi
}

export const ThumbnailImage = (props: ThumbnailImageProps) => {
  const { children, ui, ...rest } = props
  const {
    outline = false,
    selected = false,
    selectable = false,
    supported = true,
    valid = " idle",
  } = ui ?? {}

  return (
    <Box
      bdrs="sm"
      className={classes.box}
      {...rest}
      data-outline={outline}
      data-selected={supported ? selected : false}
      data-selectable={supported ? selectable : false}
      data-supported={supported}
      data-valid={supported ? valid : undefined}
    >
      {children}
    </Box>
  )
}

ThumbnailImage.Image = memo(Image)
ThumbnailImage.Label = memo(Label)
ThumbnailImage.RemoveButton = memo(RemoveButton)
ThumbnailImage.SelectableCheckbox = memo(SelectableCheckbox)
