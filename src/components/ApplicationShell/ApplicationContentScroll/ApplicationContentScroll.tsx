"use client"

import { Box, ScrollArea } from "@mantine/core"
import type { ReactNode } from "react"

/**
 * Opt-in scrolling for a page/content consumer.
 * ApplicationShell itself only owns the main viewport, not its scroll behavior.
 */
export function ApplicationContentScroll({
  children,
}: {
  children: ReactNode
}) {
  return (
    <ScrollArea
      type="hover"
      h="100%"
      w="100%"
      style={{ overscrollBehavior: "contain" }}
    >
      <Box pt="lg">{children}</Box>
    </ScrollArea>
  )
}
