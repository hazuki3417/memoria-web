import { Box } from "@mantine/core"
import React from "react"
import { styles } from "../styles"

export interface CenterProps {
  children: React.ReactNode
}

export const Center = (props: CenterProps) => {
  const { children } = props
  return (
    <Box
      style={(theme) => ({
        alignItems: "center",
        display: "flex",
        justifyContent: "center",
        width: `calc(100% - ${styles.SIDEBAR_WIDTH * 2}px)`,
        overflow: "hidden",
      })}
    >
      {children}
    </Box>
  )
}
Center.displayName = "ImageDetailModal.Slide.Body.Center"
