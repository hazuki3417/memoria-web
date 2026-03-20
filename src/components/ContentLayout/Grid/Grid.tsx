import { Box, BoxProps } from "@mantine/core"
import React from "react"

export interface GridProps extends BoxProps {
  children: React.ReactNode
}

export const Grid = (props: GridProps) => {
  const { children, style, ...rest } = props
  return (
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
  )
}
