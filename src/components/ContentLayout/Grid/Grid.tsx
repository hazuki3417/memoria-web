"use client"
import { Box, BoxProps, ScrollArea, ScrollAreaProps } from "@mantine/core"
import React from "react"

export interface GridProps extends BoxProps, Pick<ScrollAreaProps, "styles"> {
  children: React.ReactNode
}

export const Grid = (props: GridProps) => {
  const { children, style, styles, ...rest } = props
  return (
    <ScrollArea scrollbarSize={6} styles={styles}>
      <Box
        {...rest}
        style={{
          ...style,
          padding: "3px", // NOTE: outline分の調整（0pxにするとoutlineが潰れる）
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        {children}
      </Box>
    </ScrollArea>
  )
}
