import { Box, BoxProps } from "@mantine/core"
import React from "react"
import { AddImageBox } from "./AddImageBox"
import classes from "./ImageDropForm.module.css"

export type ImageDropFormUi = {
  valid?: "idle" | "accept" | "warning" | "reject"
}

export interface ImageDropFormProps
  extends Omit<BoxProps, "className" | "style" | "onDrop" | "onDropOver"> {
  children: React.ReactNode
  onFileDrop?: React.DragEventHandler<HTMLDivElement>
  ui?: ImageDropFormUi
  disabled?: boolean
}

export const ImageDropForm = (props: ImageDropFormProps) => {
  const { children, ui, onFileDrop, disabled = false, ...rest } = props
  const { valid = "idle" } = ui ?? {}

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (disabled) {
      event.preventDefault()
      return
    }
    onFileDrop?.(event)
  }

  return (
    <Box
      className={classes.box}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      data-valid={valid}
      data-disabled={disabled}
      {...rest}
    >
      {children}
    </Box>
  )
}

ImageDropForm.AddImageBox = AddImageBox
