"use client"

import { Box, Button, Group, Text } from "@mantine/core"
import { ImageDetailValueList } from "../ImageDetailValueList"
import type { ImageDetailViewerProps } from "../ImageDetailViewer/ImageDetailViewer"

export type ImageDetailTagsSectionProps = Pick<ImageDetailViewerProps, "detailValues" | "detailSectionsExpanded" | "toggleDetailSection" | "openDetailEditor">

export function ImageDetailTagsSection({ detailValues, detailSectionsExpanded, toggleDetailSection, openDetailEditor }: ImageDetailTagsSectionProps) {
  const values = detailValues.tags
  return (
    <Box>
      <Group justify="space-between" mb="sm" wrap="nowrap">
        <Group gap={6}>
          <Text size="xs" c="dimmed">Tags</Text>
          <Text size="xs" c="dimmed">({values.length})</Text>
        </Group>
        <Button size="compact-xs" variant="subtle" onClick={() => openDetailEditor("tags")}>
          編集
        </Button>
      </Group>
      <ImageDetailValueList
        values={values}
        variant="light"
        expanded={detailSectionsExpanded.tags}
        onToggle={() => toggleDetailSection("tags")}
      />
    </Box>
  )
}
