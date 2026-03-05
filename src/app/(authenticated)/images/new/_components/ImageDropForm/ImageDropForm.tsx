import { Box, BoxProps } from "@mantine/core"
import React from "react"
import { AddImageBox } from "./AddImageBox"
import classes from "./ImageDropForm.module.css"

export type ImageDropFormUi = {
  valid?: "idle" | "accept" | "warning" | "reject"
  disabled?: boolean
}

export interface ImageDropFormProps
  extends Omit<BoxProps, "className" | "style" | "onDrop" | "onDropOver"> {
  children: React.ReactNode
  ui: ImageDropFormUi
  onFileDrop?: React.DragEventHandler<HTMLDivElement>
}

export const ImageDropForm = (props: ImageDropFormProps) => {
  const { children, ui, onFileDrop, ...rest } = props

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (ui.disabled) {
      event.preventDefault()
      return
    }
    onFileDrop?.(event)
  }

  return (
    <Box
      className={classes.droparea}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "16px",
        minHeight: "inherit",
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      data-valid={ui.valid}
      data-disabled={ui.disabled}
      {...rest}
    >
      {children}
    </Box>
  )
}

ImageDropForm.AddImageBox = AddImageBox
