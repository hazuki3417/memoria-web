"use client"

import { Box } from "@mantine/core"
import type { ReactNode } from "react"

type MediaDetailLayoutProps = {
  compact: boolean | undefined
  detailInfoOpened: boolean
  preview: ReactNode
  infoPanel: ReactNode
}

/**
 * Owns the responsive split between preview and information.
 * Preview and panel retain their own controls, animations and scrolling.
 */
export function MediaDetailLayout({
  compact,
  detailInfoOpened,
  preview,
  infoPanel,
}: MediaDetailLayoutProps) {
  return (
    <Box
      h="100%"
      style={{
        display: "grid",
        gridTemplateColumns: compact
          ? "minmax(0, 1fr)"
          : "minmax(0, 1fr) auto",
        gridTemplateRows:
          compact && detailInfoOpened
            ? "minmax(0, 1fr) auto"
            : "minmax(0, 1fr)",
        background: "transparent",
      }}
    >
      {preview}
      {infoPanel}
    </Box>
  )
}
