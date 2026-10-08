"use client"

import { Box, SimpleGrid, Text } from "@mantine/core"

type GroupPreviewGridProps = {
  directMedia: string[]
  aggregateMedia?: string[]
  directMediaCount?: number
}

function GroupCell({ sources }: { sources: string[] }) {
  return (
    <Box w="100%" h="100%" bg="var(--mantine-color-default-hover)" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gridTemplateRows: "1fr 1fr", gap: 2, overflow: "hidden" }}>
      {Array.from({ length: 3 }, (_, index) => (
        <Box key={index} style={{ gridRow: index === 0 ? "1 / 3" : undefined, ...(sources[index] ? { backgroundImage: `url("${sources[index]}")`, backgroundPosition: "center", backgroundSize: "cover" } : {}) }} />
      ))}
    </Box>
  )
}

/** Shared visual preview; the owning screen controls selection and navigation. */
export function GroupPreviewGrid({ directMedia, aggregateMedia = [], directMediaCount = directMedia.length }: GroupPreviewGridProps) {
  let groupCellIndex = 0
  return (
    <SimpleGrid cols={2} spacing={4}>
      {Array.from({ length: 4 }, (_, index) => {
        const src = index < directMediaCount ? directMedia[index] : undefined
        const groupCell = index >= directMediaCount || !src
        const groupSources = groupCell ? aggregateMedia.slice(groupCellIndex++ * 3, groupCellIndex * 3) : []
        return (
          <Box key={index} bdrs="sm" style={{ position: "relative", aspectRatio: "1 / 1", overflow: "hidden", border: !groupCell ? "1px solid var(--mantine-color-default-border)" : undefined, ...(!groupCell ? { backgroundImage: `url("${src}")`, backgroundPosition: "center", backgroundSize: "cover" } : {}) }}>
            {groupCell && <GroupCell sources={groupSources} />}
            {directMediaCount > 4 && index === 3 && !groupCell && (
              <Box pos="absolute" inset={0} bg="rgba(0, 0, 0, 0.32)" style={{ display: "grid", placeItems: "center" }}>
                <Text c="white" fw={700} size="lg">…</Text>
              </Box>
            )}
          </Box>
        )
      })}
    </SimpleGrid>
  )
}
