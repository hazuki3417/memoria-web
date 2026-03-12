import { Box } from "@mantine/core"
import React from "react"
import { styles } from "../styles"

export interface RightProps {
  children: React.ReactNode
}

export const Right = (props: RightProps) => {
  const { children } = props
  return (
    <Box
      style={(theme) => ({
        alignItems: "center",
        display: "flex",
        justifyContent: "center",
        width: `${styles.SIDEBAR_WIDTH}px`,
      })}
    >
      {children}
    </Box>
  )
}
Right.displayName = "ImageDetailModal.Slide.Body.Right"
