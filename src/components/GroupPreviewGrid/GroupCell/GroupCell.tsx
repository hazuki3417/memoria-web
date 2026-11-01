"use client"

import { Box } from "@mantine/core"

export function GroupCell({ sources }: { sources: string[] }) {
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
      {(["main", "top", "bottom"] as const).map((slot, index) => (
        <Box
          key={slot}
          style={{
            gridRow: index === 0 ? "1 / 3" : undefined,
            ...(sources[index]
              ? {
                  backgroundImage: `url("${sources[index]}")`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }
              : {}),
          }}
        />
      ))}
    </Box>
  )
}
