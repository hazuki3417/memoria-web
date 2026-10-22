"use client"

import { Box, SimpleGrid, Text } from "@mantine/core"

export const previewImages = Array.from(
  { length: 9 },
  (_, index) =>
    `/__dev-assets/group-browser/group-media-${String(index + 1).padStart(2, "0")}.jpg`,
)

function GroupVisual({ startIndex }: { startIndex: number }) {
  const mediaIndexes = Array.from(
    { length: 3 },
    (_, index) => startIndex + index,
  )

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
      {mediaIndexes.map((mediaIndex, index) => (
        <Box
          key={mediaIndex}
          style={{
            gridRow: index === 0 ? "1 / 3" : undefined,
            backgroundImage: `url("${previewImages[mediaIndex % previewImages.length]}")`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
      ))}
    </Box>
  )
}

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
                <GroupVisual startIndex={groupVisualStart} />
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
