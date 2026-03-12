import { Box } from "@mantine/core"
import React from "react"
import { styles } from "../styles"

export interface LeftProps {
  children: React.ReactNode
}

export const Left = (props: LeftProps) => {
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
Left.displayName = "ImageDetailModal.Slide.Body.Left"
