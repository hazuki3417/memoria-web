"use client"

import { Box, Modal } from "@mantine/core"

import type { Dispatch, SetStateAction } from "react"
import type { MediaItem } from "@/features/media-detail/types"
import type { useMediaDetailEditing } from "@/features/media-detail/useMediaDetailEditing"
import type { useMediaDetailViewport } from "@/features/media-detail/useMediaDetailViewport"
import { MediaDetailInfoPanel } from "../MediaDetailInfoPanel"
import { MediaDetailPreview } from "../MediaDetailPreview"

type Editing = ReturnType<typeof useMediaDetailEditing>
type Viewport = ReturnType<typeof useMediaDetailViewport>
export type MediaDetailViewerProps = Pick<
  Editing,
  | "detailValues"
  | "detailSectionsExpanded"
  | "toggleDetailSection"
  | "openDetailEditor"
  | "setUnshareTarget"
  | "setShareTarget"
  | "setDetailEditor"
> &
  Pick<
    Viewport,
    | "prepareNavigation"
    | "detailInfoOpened"
    | "setDetailInfoOpened"
    | "detailZoom"
    | "setDetailZoom"
    | "detailRotate"
    | "setDetailRotate"
    | "detailRotateAnimated"
    | "setDetailRotateAnimated"
    | "detailDirection"
  > & {
    detail: MediaItem | null
    setDetail: Dispatch<SetStateAction<MediaItem | null>>
    closeMediaDetail: () => void
    onRequestDelete: () => void
    stateItems: MediaItem[]
    compact: boolean | undefined
    context: "personal" | "community"
    downloadMock: "available" | "forbidden" | "processing"
  }

/** Original MediaBrowser detail viewport markup, preserved for visual parity. */
export function MediaDetailViewer(props: MediaDetailViewerProps) {
  const { detail, stateItems, compact, detailInfoOpened, closeMediaDetail } =
    props
  return (
    <Modal
      opened={detail !== null}
      onClose={closeMediaDetail}
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
              <MediaDetailPreview
                detail={detail}
                stateItems={stateItems}
                prev={prev}
                next={next}
                closeMediaDetail={closeMediaDetail}
                setDetail={props.setDetail}
                prepareNavigation={props.prepareNavigation}
                compact={compact}
                detailZoom={props.detailZoom}
                setDetailZoom={props.setDetailZoom}
                detailRotate={props.detailRotate}
                setDetailRotate={props.setDetailRotate}
                detailRotateAnimated={props.detailRotateAnimated}
                setDetailRotateAnimated={props.setDetailRotateAnimated}
                detailDirection={props.detailDirection}
                detailInfoOpened={detailInfoOpened}
                setDetailInfoOpened={props.setDetailInfoOpened}
              />

              <MediaDetailInfoPanel
                compact={compact}
                detailInfoOpened={detailInfoOpened}
                detailValues={props.detailValues}
                detailSectionsExpanded={props.detailSectionsExpanded}
                toggleDetailSection={props.toggleDetailSection}
                openDetailEditor={props.openDetailEditor}
                setUnshareTarget={props.setUnshareTarget}
                setShareTarget={props.setShareTarget}
                setDetailEditor={props.setDetailEditor}
                context={props.context}
                downloadMock={props.downloadMock}
                onRequestDelete={props.onRequestDelete}
              />
            </Box>
          )
        })()}
    </Modal>
  )
}
