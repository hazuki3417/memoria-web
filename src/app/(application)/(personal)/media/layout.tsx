import type { ReactNode } from "react"
import { Box } from "@mantine/core"

/** Feature-owned scrolling: preserve the historical top spacing without adding a second scrollport. */
export default function FeaturePageLayout({ children }: { children: ReactNode }) {
  return <Box h="100%" pt="lg" style={{ minHeight: 0 }}>{children}</Box>
}
