"use client"

import { Box } from "@mantine/core"
import { Separator as ResizableSeparator } from "react-resizable-panels"
import type { SplitViewSeparatorProps } from "../types"

export function Separator({ style, ...props }: SplitViewSeparatorProps) {
  return (
    <ResizableSeparator
      {...props}
      style={{
        position: "relative",
        width: 17,
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: 17,
        cursor: "col-resize",
        touchAction: "none",
        outline: "none",
        ...style,
      }}
    >
      <Box
        pos="absolute"
        top={0}
        bottom={0}
        left="50%"
        w={1}
        bg="var(--mantine-color-default-border)"
        style={{ transform: "translateX(-50%)" }}
        aria-hidden
      />
      <Box
        pos="absolute"
        top="50%"
        left="50%"
        w={5}
        h={32}
        bg="var(--mantine-color-body)"
        style={{
          transform: "translate(-50%, -50%)",
          border: "1px solid var(--mantine-color-default-border)",
          borderRadius: "var(--mantine-radius-xl)",
          boxShadow: "var(--mantine-shadow-xs)",
        }}
        aria-hidden
      />
    </ResizableSeparator>
  )
}
