import { Box, ScrollArea } from "@mantine/core"
import React from "react"

export interface SlideProps {
  children: React.ReactNode
}

export const Slide = (props: SlideProps) => {
  const { children } = props
  return (
    <ScrollArea
      type="always"
      scrollHideDelay={0}
      offsetScrollbars
      scrollbarSize={6}
      style={{ width: "100%" }}
    >
      <Box
        style={{
          display: "flex",
          flexWrap: "nowrap",
          gap: "8px",
        }}
      >
        {children}
      </Box>
    </ScrollArea>
  )
}
