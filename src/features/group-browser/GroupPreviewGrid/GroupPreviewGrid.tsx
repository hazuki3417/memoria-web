"use client"

import { Box, SimpleGrid, Text } from "@mantine/core"
import { MediaGroupTile } from "@/components/MediaGroupTile"

export const previewImages = Array.from(
  { length: 9 },
  (_, index) =>
    `/__dev-assets/group-browser/group-media-${String(index + 1).padStart(2, "0")}.jpg`,
)

export function GroupPreviewGrid({
  count,
  remote = false,
  sources = [],
}: {
  count: number
  remote?: boolean
  sources?: string[]
}) {
  const previewCellIds = ["preview-1", "preview-2", "preview-3", "preview-4"]
  let groupVisualIndex = 0
  return (
    <SimpleGrid cols={2} spacing={4}>
      {previewCellIds.map((cellId, index) => {
        const media = index < Math.min(count, 4)
        const continuation = count > 4 && index === 3
        const groupVisualStart = groupVisualIndex * 3
        if (!media) groupVisualIndex += 1
        return (
          <Box
            key={cellId}
            bdrs="sm"
            style={{
              position: "relative",
              aspectRatio: "1 / 1",
              border: media
                ? "1px solid var(--mantine-color-default-border)"
                : undefined,
              overflow: "hidden",
              ...(media
                ? {
                    backgroundImage: remote
                      ? sources[index]
                        ? `url("${sources[index]}")`
                        : undefined
                      : `url("${previewImages[index % previewImages.length]}")`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                  }
                : {}),
            }}
          >
            {media && remote && !sources[index] && (
              <Box
                w="100%"
                h="100%"
                bg="var(--mantine-color-default-hover)"
                style={{ position: "absolute", inset: 0 }}
              />
            )}
            {!media &&
              (remote ? (
                <Box
                  w="100%"
                  h="100%"
                  bg="var(--mantine-color-default-hover)"
                />
              ) : (
                <MediaGroupTile
                  sources={Array.from(
                    { length: 3 },
                    (_, offset) =>
                      previewImages[
                        (groupVisualStart + offset) % previewImages.length
                      ],
                  )}
                />
              ))}
            {continuation && (
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
      })}
    </SimpleGrid>
  )
}
