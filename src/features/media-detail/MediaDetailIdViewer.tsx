"use client"

import { ActionIcon, Box, Group, Image, Text } from "@mantine/core"
import { IconInfoCircle, IconX } from "@tabler/icons-react"
import { useEffect, useRef, useState } from "react"
import { useMediaDetailUrl } from "./MediaDetailUrlProvider"
import { useMediaDetailViewport } from "./useMediaDetailViewport"
import { MediaDetailNavigationButton } from "./MediaDetailNavigationButton"
import { MediaDetailRotationControls } from "./MediaDetailRotationControls"
import { MediaDetailZoomControls } from "./MediaDetailZoomControls"
import { PreviewStatus } from "./MediaDetailReadFeedback"
import { MediaDetailLayout } from "./MediaDetailViewer/MediaDetailLayout"
import { MediaDetailViewerHost } from "./MediaDetailViewer/MediaDetailViewerHost"
import { MediaDetailInfoPanel } from "./MediaDetailInfoPanel"
import { useMediaDetailEditing } from "./useMediaDetailEditing"
import type { MediaDetailPresentation } from "./useMediaDetailPresentation"

/**
 * ID-only, read-only composition.
 *
 * This is deliberately not a replacement for the existing interactive
 * MediaDetailViewer: permissions, mutation flows, image decode/retry and
 * consumer-level integration must be verified before consumers can switch.
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
  const { navigation, navigateMediaDetail } = useMediaDetailUrl()
  const viewport = useMediaDetailViewport()
  const editing = useMediaDetailEditing(null)
  const priorId = useRef<string | null>(null)
  const move = (direction: -1 | 1) => {
    viewport.prepareNavigation(direction)
    navigateMediaDetail(direction)
  }
  const { selectedMediaId, preview, detail, groups, tags, retryDetail } = presentation
  // Never mount a detail for an unrelated URL selection.
  const opened = selectedMediaId !== null
  useEffect(() => {
    if (priorId.current !== selectedMediaId) {
      if (priorId.current !== null) {
        viewport.setDetailZoom(100)
        viewport.setDetailRotate(0)
        viewport.setDetailRotateAnimated(false)
      }
      priorId.current = selectedMediaId
    }
  }, [selectedMediaId, viewport.setDetailZoom, viewport.setDetailRotate, viewport.setDetailRotateAnimated])

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
            <Box style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "grid", gridTemplateColumns: "44px minmax(0,1fr) 44px", alignItems: "center" }}>
              <Group justify="center">{navigation.previousId && <MediaDetailNavigationButton direction={-1} onNavigate={() => move(-1)} />}</Group>
              <Box h="100%" style={{ minWidth: 0, overflow: "hidden" }}>
              {preview.kind === "ready" ? (
                <Image
                  src={preview.url}
                  alt={detail.kind === "ready" ? detail.media.originalFileName : "Media"}
                  w="100%"
                  h="100%"
                  fit="contain"
                  style={{ objectFit: "contain", transform: `rotate(${viewport.detailRotate}deg) scale(${viewport.detailZoom / 100})`, transition: viewport.detailRotateAnimated ? "transform 180ms ease" : "none" }}
                />
              ) : (
                <PreviewStatus
                  state={preview}
                  onRetry={preview.kind === "detail-error" || preview.kind === "delivery-error" ? retryDetail : undefined}
                />
              )}
              </Box>
              <Group justify="center">{navigation.nextId && <MediaDetailNavigationButton direction={1} onNavigate={() => move(1)} />}</Group>
            </Box>
            <Group h={48} px="sm" justify="space-between" wrap="nowrap" style={{ flexShrink: 0 }}>
              <Group gap={4} wrap="nowrap">
                {!compact && <>
                  <MediaDetailRotationControls setRotate={viewport.setDetailRotate} setAnimated={viewport.setDetailRotateAnimated} />
                  <MediaDetailZoomControls zoom={viewport.detailZoom} setZoom={viewport.setDetailZoom} />
                </>}
              </Group>
              <Text size="xs">{navigation.position === null || navigation.count === null ? "—" : `${navigation.position + 1} / ${navigation.count}`}</Text>
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
          <MediaDetailInfoPanel
            compact={compact}
            detailInfoOpened={infoOpened}
            detailValues={editing.detailValues}
            detailSectionsExpanded={editing.detailSectionsExpanded}
            toggleDetailSection={editing.toggleDetailSection}
            openDetailEditor={editing.openDetailEditor}
            setUnshareTarget={editing.setUnshareTarget}
            setShareTarget={editing.setShareTarget}
            setDetailEditor={editing.setDetailEditor}
            context="personal"
            downloadMock="forbidden"
            onRequestDelete={() => {}}
            detailReadState={detail}
            groupsReadState={groups}
            tagsReadState={tags}
            onRetryDetail={retryDetail}
            readOnly
          />
        }
      />
    </MediaDetailViewerHost>
  )
}
