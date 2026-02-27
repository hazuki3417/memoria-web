import { Box } from "@mantine/core"
import React from "react"

export interface GridProps {
  children: React.ReactNode
}

export const Grid = (props: GridProps) => {
  const { children } = props
  return (
    <Box
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "8px",
      }}
    >
      {children}
    </Box>
  )
}
