"use client"

import { Box } from "@mantine/core"

/** Media Group identity artwork. Images are decorative, not direct Media entries. */
export function MediaGroupTile({ sources = [] }: { sources?: string[] }) {
  return (
    <Box
      w="100%"
      h="100%"
      bg="var(--mantine-color-default-hover)"
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap: 2,
        overflow: "hidden",
      }}
    >
      {sources.slice(0, 3).map((source, index) => (
        <Box
          key={index}
          style={{
            gridRow: index === 0 ? "1 / 3" : undefined,
            backgroundImage: `url("${source}")`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
      ))}
    </Box>
  )
}
