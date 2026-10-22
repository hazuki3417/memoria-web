"use client"

import { Box, Text } from "@mantine/core"
import type { ReactNode } from "react"

/** One Media thumbnail. The consumer owns selection, navigation and processing state. */
export function MediaTile({
  src,
  label,
  children,
}: {
  src: string | null
  label: string
  children?: ReactNode
}) {
  return (
    <Box
      w="100%"
      h="100%"
      style={{
        position: "relative",
        backgroundImage: src ? `url("${src}")` : undefined,
        backgroundColor: "var(--mantine-color-default-hover)",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      {!src && (
        <Text size="xs" c="dimmed" ta="center">
          {label}
        </Text>
      )}
      {children}
    </Box>
  )
}
