"use client"

import { Box } from "@mantine/core"
import type { ComponentProps } from "react"
import {
  Group as ResizableGroup,
  Panel as ResizablePanel,
  Separator as ResizableSeparator,
} from "react-resizable-panels"

export type SplitViewRootProps = ComponentProps<typeof ResizableGroup>
export type SplitViewPaneProps = Omit<\n  ComponentProps<typeof ResizablePanel>,\n  "minSize"\n> & {\n  minWidth?: number\n}
export type SplitViewSeparatorProps = ComponentProps<typeof ResizableSeparator>

function Root({ style, ...props }: SplitViewRootProps) {
  return (
    <ResizableGroup
      orientation="horizontal"
      style={{ minWidth: 0, minHeight: 0, ...style }}
      {...props}
    />
  )
}

function Pane({ minWidth, style, ...props }: SplitViewPaneProps) {
  return (
    <ResizablePanel
      style={{ minWidth: 0, minHeight: 0, overflow: "hidden", ...style }}
      {...props}
    />
  )
}

function Separator({ style, ...props }: SplitViewSeparatorProps) {
  return (
    <ResizableSeparator
      {...props}
      style={{
        position: "relative",
        width: 17,
        flex: "0 0 17px",
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

Root.displayName = "SplitView.Root"
Pane.displayName = "SplitView.Pane"
Separator.displayName = "SplitView.Separator"

export const SplitView = { Root, Pane, Separator }
