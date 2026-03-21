"use client"
import { Box, ScrollArea } from "@mantine/core"
import React from "react"

export interface SlideProps {
  children: React.ReactNode
}

export const Slide = (props: SlideProps) => {
  const { children } = props
  return (
    <ScrollArea scrollbarSize={6}>
      <Box
        style={(theme) => ({
          padding: "3px", // NOTE: outline分の調整（0pxにするとoutlineが潰れる）
          display: "flex",
          gap: theme.spacing.xs,
        })}
      >
        {children}
      </Box>
    </ScrollArea>
  )
}
