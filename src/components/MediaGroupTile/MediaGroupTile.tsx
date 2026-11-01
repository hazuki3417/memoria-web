"use client"

import { Box, Center } from "@mantine/core"
import { IconPhoto } from "@tabler/icons-react"

/**
 * Decorative Group artwork. Its three cells have fixed positions regardless
 * of the number of supplied images. Sources do not represent total Media count.
 */
export function MediaGroupTile({ sources = [] }: { sources?: string[] }) {
  return (
    <Box
      w="100%"
      h="100%"
      bg="var(--mantine-color-default-hover)"
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gridTemplateRows: "minmax(0, 1fr) minmax(0, 1fr)",
        gap: 2,
        overflow: "hidden",
      }}
    >
      {Array.from({ length: 3 }, (_, index) => {
        const source = sources[index]
        return (
          <Box
            key={index}
            style={{
              gridRow: index === 0 ? "1 / 3" : undefined,
              position: "relative",
              minWidth: 0,
              minHeight: 0,
              overflow: "hidden",
              backgroundColor: "var(--mantine-color-default-border)",
            }}
          >
            {source ? (
              <Box
                role="presentation"
                w="100%"
                h="100%"
                style={{
                  backgroundImage: `url("${source}")`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                }}
              />
            ) : (
              <Center w="100%" h="100%" aria-hidden="true">
                <IconPhoto
                  size="38%"
                  stroke={1.5}
                  color="var(--mantine-color-dimmed)"
                  style={{ maxWidth: 26, minWidth: 14 }}
                />
              </Center>
            )}
          </Box>
        )
      })}
    </Box>
  )
}
