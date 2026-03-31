import { Box, BoxProps } from "@mantine/core"
import React from "react"

export interface ImageContainerProps extends BoxProps {
  children: React.ReactNode
}

export const ImageContainer = (props: ImageContainerProps) => {
  const { style, ...rest } = props
  return (
    <Box
      {...rest}
      h="320px"
      w="320px"
      style={(theme) => ({
        ...style,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap: "calc(.3rem * var(--mantine-scale))",
      })}
    />
  )
}
ImageContainer.displayName = "ImageGroup.ImageContainer"
