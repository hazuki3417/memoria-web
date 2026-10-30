"use client"

import { ActionIcon, Box, Group, Image, Stack, Text } from "@mantine/core"
import { IconInfoCircle, IconX } from "@tabler/icons-react"
import { useState } from "react"
import { DetailCollectionStatus, DetailMetadataStatus, PreviewStatus } from "./MediaDetailReadFeedback"
import { MediaDetailLayout } from "./MediaDetailViewer/MediaDetailLayout"
import { MediaDetailViewerHost } from "./MediaDetailViewer/MediaDetailViewerHost"
import type { MediaDetailPresentation } from "./useMediaDetailPresentation"

/**
 * ID-only, read-only composition.
 *
 * This is deliberately not a replacement for the existing interactive
 * MediaDetailViewer: permissions, mutation flows, image decode/retry and
 * navigation must be wired before consumers can switch.
 */
export function MediaDetailIdViewer({
  presentation,
  onClose,
  compact,
}: {
  presentation: MediaDetailPresentation
  onClose: () => void
  compact: boolean | undefined
}) {
  const [infoOpened, setInfoOpened] = useState(true)
  const { selectedMediaId, preview, detail, groups, tags, retryDetail } = presentation
  // Never mount a detail for an unrelated URL selection.
  const opened = selectedMediaId !== null

  return (
    <MediaDetailViewerHost opened={opened} onClose={onClose}>
      <MediaDetailLayout
        compact={compact}
        detailInfoOpened={infoOpened}
        preview={
          <Box style={{ display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0 }}>
            <Group h={44} px="xs" justify="flex-end" style={{ flexShrink: 0 }}>
              <ActionIcon variant="subtle" color="gray" aria-label="閉じる" onClick={onClose}>
                <IconX size={18} />
              </ActionIcon>
            </Group>
            <Box style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
              {preview.kind === "ready" ? (
                <Image
                  src={preview.url}
                  alt={detail.kind === "ready" ? detail.media.originalFileName : "Media"}
                  w="100%"
                  h="100%"
                  fit="contain"
                />
              ) : (
                <PreviewStatus
                  state={preview}
                  onRetry={preview.kind === "detail-error" || preview.kind === "delivery-error" ? retryDetail : undefined}
                />
              )}
            </Box>
            <Group h={48} px="sm" justify="flex-end" style={{ flexShrink: 0 }}>
              <ActionIcon
                variant={infoOpened ? "light" : "subtle"}
                aria-label={infoOpened ? "情報を閉じる" : "情報を開く"}
                onClick={() => setInfoOpened((value) => !value)}
              >
                <IconInfoCircle size={18} />
              </ActionIcon>
            </Group>
          </Box>
        }
        infoPanel={
          infoOpened ? (
            <Box
              style={{
                gridColumn: compact ? "1" : "2",
                gridRow: compact ? "2" : "1",
                width: compact ? "100%" : 340,
                minWidth: 0,
                minHeight: 0,
                overflowY: "auto",
                background: "var(--mantine-color-body)",
                borderLeft: compact ? undefined : "1px solid var(--mantine-color-default-border)",
                borderTop: compact ? "1px solid var(--mantine-color-default-border)" : undefined,
              }}
            >
              <Stack gap="md" p="md">
                <Text fw={600} size="sm">Media情報</Text>
                <DetailMetadataStatus state={detail} onRetry={retryDetail} />
                <DetailCollectionStatus title="Groups" state={groups} />
                {groups.kind === "ready" && <Text size="xs">{groups.values.map((item) => item.name).join(", ") || "なし"}</Text>}
                <DetailCollectionStatus title="Tags" state={tags} />
                {tags.kind === "ready" && <Text size="xs">{tags.values.map((item) => item.name).join(", ") || "なし"}</Text>}
              </Stack>
            </Box>
          ) : null
        }
      />
    </MediaDetailViewerHost>
  )
}
