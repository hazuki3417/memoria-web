"use client"

import { useMediaQuery } from "@mantine/hooks"
import { useEffect, useState } from "react"
import { showNotification } from "@/components/Feedback"
import { CommunityShareModal } from "../CommunityShareModal"
import { CommunityUnshareModal } from "../CommunityUnshareModal"
import { GroupsEditModal } from "../GroupsEditModal"
import { MediaDeleteModal } from "../MediaDeleteModal"
import { MediaDetailViewer } from "../MediaDetailViewer"
import { TagsEditModal } from "../TagsEditModal"
import type { MediaItem } from "../types"
import { useMediaDetailEditing } from "../useMediaDetailEditing"
import { useMediaDetailViewport } from "../useMediaDetailViewport"

export type MediaDetailDialogProps = {
  items: MediaItem[]
  initialId?: string
  onClose: () => void
  contextKind?: "personal" | "community"
  downloadMock?: "available" | "forbidden" | "processing"
  groupOptions?: string[]
  groupMemberships?: Record<string, string[]>
  onSaveGroups?: (mediaId: string, groupNames: string[]) => Promise<void>
}

export function MediaDetailDialog({
  items,
  initialId,
  onClose,
  contextKind = "personal",
  downloadMock = "available",
  groupOptions,
  groupMemberships,
  onSaveGroups,
}: MediaDetailDialogProps) {
  const compact = useMediaQuery("(max-width: 47.99em)")
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null)
  const [detail, setDetail] = useState<MediaItem | null>(
    () => items.find((item) => item.id === initialId) ?? null,
  )
  useEffect(() => {
    setDetail(items.find((item) => item.id === initialId) ?? null)
  }, [initialId, items])
  const closeMediaDetail = () => {
    setDeleteTarget(null)
    setDetail(null)
    onClose()
  }
  const confirmDelete = () => {
    setDeleteTarget(null)
    closeMediaDetail()
    showNotification({
      kind: "info",
      title: "Mediaの削除",
      description:
        "Mediaの削除操作を確認しました。実際のデータは削除されていません。",
    })
  }
  const {
    detailEditor,
    setDetailEditor,
    detailDraft,
    setDetailDraft,
    shareTarget,
    setShareTarget,
    unshareTarget,
    setUnshareTarget,
    detailValues,
    openDetailEditor,
    saveDetailDraft,
    addCommunityShare,
    removeCommunityShare,
    detailSectionsExpanded,
    toggleDetailSection,
  } = useMediaDetailEditing(
    detail,
    onSaveGroups
      ? { memberships: groupMemberships ?? {}, onSave: onSaveGroups }
      : undefined,
  )
  const {
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
    setDetailDirection,
  } = useMediaDetailViewport()
  void setDetailDirection
  return (
    <>
      <MediaDetailViewer
        detail={detail}
        setDetail={setDetail}
        closeMediaDetail={closeMediaDetail}
        onRequestDelete={() => {
          if (detail) setDeleteTarget(detail)
        }}
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
      <MediaDeleteModal
        target={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
      <CommunityUnshareModal
        unshareTarget={unshareTarget}
        setUnshareTarget={setUnshareTarget}
        removeCommunityShare={removeCommunityShare}
      />
      <CommunityShareModal
        detailEditor={detailEditor}
        setDetailEditor={setDetailEditor}
        detailValues={detailValues}
        shareTarget={shareTarget}
        setShareTarget={setShareTarget}
        addCommunityShare={addCommunityShare}
      />
      <TagsEditModal
        detailEditor={detailEditor}
        setDetailEditor={setDetailEditor}
        detailDraft={detailDraft}
        setDetailDraft={setDetailDraft}
        saveDetailDraft={saveDetailDraft}
      />
      <GroupsEditModal
        groupOptions={groupOptions}
        detailEditor={detailEditor}
        setDetailEditor={setDetailEditor}
        detailDraft={detailDraft}
        setDetailDraft={setDetailDraft}
        saveDetailDraft={saveDetailDraft}
      />
    </>
  )
}
