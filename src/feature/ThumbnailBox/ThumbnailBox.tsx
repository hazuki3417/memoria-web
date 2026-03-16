import { FieldValid } from "@/components"
import { Box, BoxProps } from "@mantine/core"
import React, { memo } from "react"
import { Image } from "./Image"
import { Label } from "./Label"
import { RemoveButton } from "./RemoveButton"
import { SelectableCheckbox } from "./SelectableCheckbox"
import classes from "./ThumbnailBox.module.css"

export type ThumbnailBoxUi = {
  outline?: boolean
  selected?: boolean
  selectable?: boolean
  supported?: boolean
  valid?: FieldValid
}

export interface ThumbnailBoxProps extends BoxProps {
  children: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLDivElement>
  ui?: ThumbnailBoxUi
}

export const ThumbnailBox = (props: ThumbnailBoxProps) => {
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

ThumbnailBox.Image = memo(Image)
ThumbnailBox.Label = memo(Label)
ThumbnailBox.RemoveButton = memo(RemoveButton)
ThumbnailBox.SelectableCheckbox = memo(SelectableCheckbox)
