"use client"

import { GroupCell } from "./GroupCell"

import { Box, SimpleGrid, Text } from "@mantine/core"

type GroupPreviewGridProps = {
  directMedia: string[]
  aggregateMedia?: string[]
  directMediaCount?: number
}

/** Shared visual preview; the owning screen controls selection and navigation. */
export function GroupPreviewGrid({
  directMedia,
  aggregateMedia = [],
  directMediaCount = directMedia.length,
}: GroupPreviewGridProps) {
  let groupCellIndex = 0
  return (
    <SimpleGrid cols={2} spacing={4}>
      {(["top-left", "top-right", "bottom-left", "bottom-right"] as const).map(
        (slot, index) => {
          const src = index < directMediaCount ? directMedia[index] : undefined
          const groupCell = index >= directMediaCount || !src
          const groupSources = groupCell
            ? aggregateMedia.slice(groupCellIndex++ * 3, groupCellIndex * 3)
            : []
          return (
            <Box
              key={slot}
              bdrs="sm"
              style={{
                position: "relative",
                aspectRatio: "1 / 1",
                overflow: "hidden",
                border: !groupCell
                  ? "1px solid var(--mantine-color-default-border)"
                  : undefined,
                ...(!groupCell
                  ? {
                      backgroundImage: `url("${src}")`,
                      backgroundPosition: "center",
                      backgroundSize: "cover",
                    }
                  : {}),
              }}
            >
              {groupCell && <GroupCell sources={groupSources} />}
              {directMediaCount > 4 && index === 3 && !groupCell && (
                <Box
                  pos="absolute"
                  inset={0}
                  bg="rgba(0, 0, 0, 0.32)"
                  style={{ display: "grid", placeItems: "center" }}
                >
                  <Text c="white" fw={700} size="lg">
                    …
                  </Text>
                </Box>
              )}
            </Box>
          )
        },
      )}
    </SimpleGrid>
  )
}
