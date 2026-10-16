"use client"

import { useEffect, useState } from "react"
import { useMediaQuery } from "@mantine/hooks"
import { useMediaDetailEditing } from "../useMediaDetailEditing"
import { useMediaDetailViewport } from "../useMediaDetailViewport"
import { MediaDetailViewer } from "../MediaDetailViewer"
import { CommunityUnshareDialog } from "../CommunityUnshareDialog"
import { CommunityShareDialog } from "../CommunityShareDialog"
import { TagsEditDialog } from "../TagsEditDialog"
import { GroupsEditDialog } from "../GroupsEditDialog"
import type { MediaItem } from "../types"

export type MediaDetailDialogProps = {
  items: MediaItem[]
  initialId?: string
  onClose: () => void
  contextKind?: "personal" | "community"
  downloadMock?: "available" | "forbidden" | "processing"
}

export function MediaDetailDialog({ items, initialId, onClose, contextKind = "personal", downloadMock = "available" }: MediaDetailDialogProps) {
  const compact = useMediaQuery("(max-width: 47.99em)")
  const [detail, setDetail] = useState<MediaItem | null>(() => items.find(item => item.id === initialId) ?? null)
  useEffect(() => { setDetail(items.find(item => item.id === initialId) ?? null) }, [initialId, items])
  const closeMediaDetail = () => { setDetail(null); onClose() }
  const {
    detailEditor, setDetailEditor, detailDraft, setDetailDraft,
    shareTarget, setShareTarget, unshareTarget, setUnshareTarget,
    detailValues, openDetailEditor, saveDetailDraft,
    addCommunityShare, removeCommunityShare,
    detailSectionsExpanded, toggleDetailSection,
  } = useMediaDetailEditing(detail)
  const {
    prepareNavigation, detailInfoOpened, setDetailInfoOpened,
    detailZoom, setDetailZoom, detailRotate, setDetailRotate,
    detailRotateAnimated, setDetailRotateAnimated, detailDirection, setDetailDirection,
  } = useMediaDetailViewport()
  void setDetailDirection
  return (
    <>
      <MediaDetailViewer
        detail={detail}
        setDetail={setDetail}
        closeMediaDetail={closeMediaDetail}
        stateItems={items}
        compact={compact}
        context={contextKind}
        downloadMock={downloadMock}
        detailValues={detailValues}
        detailSectionsExpanded={detailSectionsExpanded}
        toggleDetailSection={toggleDetailSection}
        openDetailEditor={openDetailEditor}
        setUnshareTarget={setUnshareTarget}
        setShareTarget={setShareTarget}
        setDetailEditor={setDetailEditor}
        prepareNavigation={prepareNavigation}
        detailInfoOpened={detailInfoOpened}
        setDetailInfoOpened={setDetailInfoOpened}
        detailZoom={detailZoom}
        setDetailZoom={setDetailZoom}
        detailRotate={detailRotate}
        setDetailRotate={setDetailRotate}
        detailRotateAnimated={detailRotateAnimated}
        setDetailRotateAnimated={setDetailRotateAnimated}
        detailDirection={detailDirection}
      />
      <CommunityUnshareDialog
        unshareTarget={unshareTarget}
        setUnshareTarget={setUnshareTarget}
        removeCommunityShare={removeCommunityShare}
      />
      <CommunityShareDialog
        detailEditor={detailEditor}
        setDetailEditor={setDetailEditor}
        detailValues={detailValues}
        shareTarget={shareTarget}
        setShareTarget={setShareTarget}
        addCommunityShare={addCommunityShare}
      />
      <TagsEditDialog
        detailEditor={detailEditor}
        setDetailEditor={setDetailEditor}
        detailDraft={detailDraft}
        setDetailDraft={setDetailDraft}
        saveDetailDraft={saveDetailDraft}
      />
      <GroupsEditDialog
        detailEditor={detailEditor}
        setDetailEditor={setDetailEditor}
        detailDraft={detailDraft}
        setDetailDraft={setDetailDraft}
        saveDetailDraft={saveDetailDraft}
      />
    </>
  )
}
