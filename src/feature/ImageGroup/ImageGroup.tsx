import { FieldValid } from "@/components"
import { Box, BoxProps } from "@mantine/core"
import React, { memo } from "react"
import { CountBadge } from "./CountBadge"
import { Image } from "./Image"
import { ImageContainer } from "./ImageContainer"
import classes from "./ImageGroup.module.css"
import { ImageSkeleton } from "./ImageSkeleton"
import { InfoContainer } from "./InfoContainer"
import { SelectableCheckbox } from "./SelectableCheckbox"
import { Title } from "./Title"

export type ImageGroupUi = {
  outline?: boolean
  selected?: boolean
  selectable?: boolean
  supported?: boolean
  valid?: FieldValid
}

export interface ImageGroupProps extends BoxProps {
  children: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLDivElement>
  ui?: ImageGroupUi
}

export const ImageGroup = (props: ImageGroupProps) => {
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

ImageGroup.Image = memo(Image)
ImageGroup.ImageSkeleton = memo(ImageSkeleton)
ImageGroup.ImageContainer = memo(ImageContainer)
ImageGroup.InfoContainer = memo(InfoContainer)
ImageGroup.Title = memo(Title)
ImageGroup.CountBadge = memo(CountBadge)
ImageGroup.SelectableCheckbox = memo(SelectableCheckbox)
