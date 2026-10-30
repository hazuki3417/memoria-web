"use client"

import type { Dispatch, SetStateAction } from "react"
import type { MediaItem } from "@/features/media-detail/types"
import type { useMediaDetailEditing } from "@/features/media-detail/useMediaDetailEditing"
import type { useMediaDetailViewport } from "@/features/media-detail/useMediaDetailViewport"
import { MediaDetailInfoPanel } from "../MediaDetailInfoPanel"
import { MediaDetailPreview } from "../MediaDetailPreview"
import { MediaDetailViewerHost } from "./MediaDetailViewerHost"
import { MediaDetailLayout } from "./MediaDetailLayout"
import type { DetailReadState, PreviewReadState, CollectionReadState } from "../mediaDetailReadState"

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
    selectedId?: string | null
    navigation?: { previousId: string | null; nextId: string | null; position: number | null; count: number | null }
    navigateById?: (direction: -1 | 1) => void
    setDetail: Dispatch<SetStateAction<MediaItem | null>>
    closeMediaDetail: () => void
    onRequestDelete: () => void
    stateItems: MediaItem[]
    compact: boolean | undefined
    context: "personal" | "community"
    downloadMock: "available" | "forbidden" | "processing"
    allowDelete?: boolean
    onEditTags?: () => void
    onEditGroups?: () => void
    read?: {
      detail: DetailReadState
      preview: PreviewReadState
      groups: CollectionReadState
      tags: CollectionReadState
      retryDetail?: () => void
      retryImage?: () => void
      pollingStopped?: boolean
      dateFormat?: "YYYY_MM_DD" | "MM_DD_YYYY" | "DD_MM_YYYY"
      fileSizeUnit?: "DECIMAL" | "BINARY"
    }
  }

/** Composes the existing Media Detail preview and info panel without owning the overlay/layout mechanics. */
export function MediaDetailViewer(props: MediaDetailViewerProps) {
  const { detail, stateItems, compact, detailInfoOpened, closeMediaDetail } =
    props
  return (
    <MediaDetailViewerHost
      opened={Boolean(props.selectedId ?? detail?.id)}
      onClose={closeMediaDetail}
    >
      {(props.selectedId || detail) &&
        (() => {
          const detailIndex = stateItems.findIndex(
            (item) => item.id === (props.selectedId ?? detail?.id),
          )
          const prev = detailIndex > 0 ? stateItems[detailIndex - 1] : null
          const next =
            detailIndex >= 0 && detailIndex < stateItems.length - 1
              ? stateItems[detailIndex + 1]
              : null
          return (
            <MediaDetailLayout
              compact={compact}
              detailInfoOpened={detailInfoOpened}
              preview={
                <MediaDetailPreview
                  detail={detail}
                  selectedId={props.selectedId}
                  navigation={props.navigation}
                  navigateById={props.navigateById}
                  readState={props.read?.preview}
                  onRetryImage={props.read?.retryImage}
                  pollingStopped={props.read?.pollingStopped}
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
              }
              infoPanel={
                <MediaDetailInfoPanel
                  detailReadState={props.read?.detail}
                  dateFormat={props.read?.dateFormat}
                  fileSizeUnit={props.read?.fileSizeUnit}
                  groupsReadState={props.read?.groups}
                  tagsReadState={props.read?.tags}
                  onRetryDetail={props.read?.retryDetail}
                  readOnly={Boolean(props.read)}
                  allowDelete={props.allowDelete}
                  onEditTags={props.onEditTags}
                  onEditGroups={props.onEditGroups}
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
              }
            />
          )
        })()}
    </MediaDetailViewerHost>

  )
}
