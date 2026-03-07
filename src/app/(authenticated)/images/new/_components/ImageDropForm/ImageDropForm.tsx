import { FieldValid } from "@/components"
import { Box, BoxProps } from "@mantine/core"
import React, { useState } from "react"
import { AddImageBox } from "./AddImageBox"
import classes from "./ImageDropForm.module.css"

export type ImageDropFormUi = {
  valid?: FieldValid
}

export interface ImageDropFormProps
  extends Omit<
    BoxProps,
    | "className"
    | "style"
    | "onDrop"
    | "onDragEnter"
    | "ondragLeave"
    | "onDropOver"
  > {
  children: React.ReactNode
  onFileDrop?: React.DragEventHandler<HTMLDivElement>
  ui?: ImageDropFormUi
  disabled?: boolean
}

export const ImageDropForm = (props: ImageDropFormProps) => {
  const { children, ui, onFileDrop, disabled = false, ...rest } = props
  const { valid = "idle" } = ui ?? {}

  const [isActive, setIsActive] = useState(false)

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (!disabled) setIsActive(true)
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsActive(false)
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsActive(false)
    if (disabled) {
      return
    }
    onFileDrop?.(event)
  }

  return (
    <Box
      className={classes.box}
      onDrop={handleDrop}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      data-active={isActive}
      data-valid={valid}
      data-disabled={disabled}
      {...rest}
    >
      {children}
    </Box>
  )
}

ImageDropForm.AddImageBox = AddImageBox
