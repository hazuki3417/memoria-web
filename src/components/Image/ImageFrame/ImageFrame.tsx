import cx from "clsx"
import { Paper, PaperProps } from "@mantine/core"
import classes from "./ImageFrame.module.css"
import React from "react"

export type ImageFrameUi = {
  selected?: boolean
  selectable?: boolean
  valid?: "idle" | "accept" | "warning" | "reject"
}

export type ImageFrameHandler = {
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
}

export interface ImageFrameProps extends PaperProps {
  children: React.ReactNode
  handler?: ImageFrameHandler
  ui?: ImageFrameUi
}

const defaultUi: Required<ImageFrameUi> = {
  selected: false,
  selectable: false,
  valid: "idle",
}

export const ImageFrame = (props: ImageFrameProps) => {
  const { className, children, handler, ...rest } = props
  const ui = { ...defaultUi, ...rest.ui }

  return (
    <Paper
      className={cx(classes.paper, className)}
      data-selected={ui.selected}
      data-selectable={ui.selectable}
      data-valid={ui.valid}
      onClick={handler?.onClick}
      {...rest}
      data-testid="click-image-frame"
    >
      {children}
    </Paper>
  )
}
