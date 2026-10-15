"use client"

import { Box, Button, Divider, Group, Text } from "@mantine/core"
import { ImageDetailValueList } from "../ImageDetailValueList"
import type { ImageDetailViewerProps } from "../ImageDetailViewer/ImageDetailViewer"

export type ImageDetailGroupsSectionProps = Pick<ImageDetailViewerProps, "detailValues" | "detailSectionsExpanded" | "toggleDetailSection" | "openDetailEditor">

export function ImageDetailGroupsSection({ detailValues, detailSectionsExpanded, toggleDetailSection, openDetailEditor }: ImageDetailGroupsSectionProps) {
  const values = detailValues.groups
  return (
    <Box>
      <Group justify="space-between" mb="sm" wrap="nowrap">
        <Group gap={6}>
          <Text size="xs" c="dimmed">Groups</Text>
          <Text size="xs" c="dimmed">({values.length})</Text>
        </Group>
        <Button
          size="compact-xs"
          variant="subtle"
          onClick={() => openDetailEditor("groups")}
        >
          編集
        </Button>
      </Group>
      <ImageDetailValueList
        values={values}
        variant="outline"
        expanded={detailSectionsExpanded.groups}
        onToggle={() => toggleDetailSection("groups")}
      />
      <Divider
        mt="md"
        style={{ marginInline: "calc(-1 * var(--mantine-spacing-md))" }}
      />
    </Box>
  )
}
