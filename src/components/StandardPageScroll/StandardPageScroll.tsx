"use client"
import { Box, ScrollArea } from "@mantine/core"
import type { ReactNode } from "react"
/** Shared implementation for opt-in standard route/page scrolling, not shell-owned. */
export function StandardPageScroll({ children }: { children: ReactNode }) {
  return <ScrollArea type="hover" h="100%" w="100%" style={{ overscrollBehavior: "contain" }}><Box pt="lg">{children}</Box></ScrollArea>
}
