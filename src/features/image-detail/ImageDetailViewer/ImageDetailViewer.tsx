"use client"

import { Box, Modal } from "@mantine/core"


import type { Dispatch, SetStateAction } from "react"
import type { MediaItem } from "@/features/image-detail/types"

import { ImageDetailInfoPanel } from "../ImageDetailInfoPanel"
import { ImageDetailPreview } from "../ImageDetailPreview"
import type { useImageDetailEditing } from "@/features/image-detail/useImageDetailEditing"
import type { useImageDetailViewport } from "@/features/image-detail/useImageDetailViewport"

type Editing = ReturnType<typeof useImageDetailEditing>
type Viewport = ReturnType<typeof useImageDetailViewport>
export type ImageDetailViewerProps = Pick<Editing, "detailValues" | "detailSectionsExpanded" | "toggleDetailSection" | "openDetailEditor" | "setUnshareTarget" | "setShareTarget" | "setDetailEditor"> & Pick<Viewport, "prepareNavigation" | "detailInfoOpened" | "setDetailInfoOpened" | "detailZoom" | "setDetailZoom" | "detailRotate" | "setDetailRotate" | "detailRotateAnimated" | "setDetailRotateAnimated" | "detailDirection"> & {
  detail: MediaItem | null
  setDetail: Dispatch<SetStateAction<MediaItem | null>>
  closeImageDetail: () => void
  stateItems: MediaItem[]
  compact: boolean | undefined
  context: "personal" | "community"
  downloadMock: "available" | "forbidden" | "processing"
}

/** Original MediaBrowser detail viewport markup, preserved for visual parity. */
export function ImageDetailViewer(props: ImageDetailViewerProps) {
  const {
  detail,
  setDetail,
  closeImageDetail,
  stateItems,
  compact,
  context,
  downloadMock,
  detailValues,
  detailSectionsExpanded,
  toggleDetailSection,
  openDetailEditor,
  setUnshareTarget,
  setShareTarget,
  setDetailEditor,
  prepareNavigation,
  detailInfoOpened,
  setDetailInfoOpened,
  detailZoom,
  setDetailZoom,
  detailRotate,
  setDetailRotate,
  detailRotateAnimated,
  setDetailRotateAnimated,
  detailDirection,
} = props
  return (
    <>
      <Modal
        opened={detail !== null}
        onClose={closeImageDetail}
        fullScreen
        portalProps={{ target: "#application-modal-root" }}
        padding={0}
        withCloseButton={false}
        styles={{
          content: { background: "transparent" },
          body: { height: "100dvh", padding: 0, background: "transparent" },
        }}
      >
        {detail &&
          (() => {
            const detailIndex = stateItems.findIndex(
              (item) => item.id === detail.id,
            )
            const prev = detailIndex > 0 ? stateItems[detailIndex - 1] : null
            const next =
              detailIndex >= 0 && detailIndex < stateItems.length - 1
                ? stateItems[detailIndex + 1]
                : null
            return (
              <Box
                h="100%"
                style={{
                  display: "grid",
                  gridTemplateColumns: compact
                    ? "minmax(0, 1fr)"
                    : "minmax(0, 1fr) auto",
                  gridTemplateRows:
                    compact && detailInfoOpened
                      ? "minmax(0, 1fr) auto"
                      : "minmax(0, 1fr)",
                  background: "transparent",
                }}
              >
                <ImageDetailPreview {...props} detail={detail} prev={prev} next={next} />

                <ImageDetailInfoPanel {...props} />
              </Box>
            )
          })()}
      </Modal>
    </>
  )
}
