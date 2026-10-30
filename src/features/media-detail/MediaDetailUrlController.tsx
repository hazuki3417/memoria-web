"use client"

import { useMediaQuery } from "@mantine/hooks"
import { gql, useMutation } from "@apollo/client"
import { Button, Group, Text } from "@mantine/core"
import { useState } from "react"
import { Modal } from "@/components/Modal"
import { showNotification } from "@/components/Feedback"
import { useEffect, useRef } from "react"
import { MediaDetailViewer } from "./MediaDetailViewer"
import { useMediaDetailEditing } from "./useMediaDetailEditing"
import { useMediaDetailViewport } from "./useMediaDetailViewport"
import { useMediaDetailPresentation } from "./useMediaDetailPresentation"
import { useMediaDetailUrl } from "./MediaDetailUrlProvider"
import { getMediaNavigation } from "./mediaDetailNavigation"
import type { MediaDetailScope } from "./useMediaDetailRead"

const DELETE_MEDIA = gql`
  mutation MediaDetailDelete($input: DeleteMediaInput!) {
    deleteMedia(input: $input) { mediaId status }
  }
`

/**
 * Application-level controller for the ORIGINAL Viewer, not an alternative UI.
 * Never enable fixture-only mutation actions for URL/GraphQL selections.
 */
export function MediaDetailUrlController({ scope, wrap = false }: { scope: MediaDetailScope; wrap?: boolean }) {
  const url = useMediaDetailUrl()
  const presentation = useMediaDetailPresentation(scope)
  const navigation = getMediaNavigation(url.snapshot, url.selectedMediaId, wrap)
  const viewport = useMediaDetailViewport()
  const editing = useMediaDetailEditing(null)
  const compact = useMediaQuery("(max-width: 47.99em)")
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState(false)
  const [deleteMutation, { loading: deleting }] = useMutation<
    { deleteMedia: { mediaId: string; status: string } },
    { input: { mediaId: string; idempotencyKey: string } }
  >(DELETE_MEDIA)
  const deletionKey = useRef<{ mediaId: string; key: string } | null>(null)
  const deleteConfirmed = async () => {
    if (!deleteTarget || deleting) return
    const mediaId = deleteTarget
    if (!deletionKey.current || deletionKey.current.mediaId !== mediaId) {
      deletionKey.current = { mediaId, key: crypto.randomUUID() }
    }
    setDeleteError(false)
    try {
      const response = await deleteMutation({
        variables: { input: { mediaId, idempotencyKey: deletionKey.current.key } },
      })
      if (response.data?.deleteMedia.mediaId !== mediaId || response.data.deleteMedia.status !== "DELETING") {
        setDeleteError(true)
        return
      }
      setDeleteTarget(null)
      deletionKey.current = null
      url.closeMediaDetail()
      showNotification({ kind: "success", title: "Mediaの削除", description: "削除処理を受け付けました。" })
    } catch {
      setDeleteError(true)
    }
  }
  const previousId = useRef<string | null>(null)
  useEffect(() => {
    const nextId = presentation.selectedMediaId
    if (previousId.current !== nextId) {
      if (previousId.current !== null) {
        viewport.setDetailZoom(100)
        viewport.setDetailRotate(0)
        viewport.setDetailRotateAnimated(false)
      }
      previousId.current = nextId
    }
  }, [presentation.selectedMediaId, viewport.setDetailZoom, viewport.setDetailRotate, viewport.setDetailRotateAnimated])

  return (
    <>
    <MediaDetailViewer
      detail={null}
      selectedId={presentation.selectedMediaId}
      navigation={navigation}
      navigateById={(direction) => url.navigateMediaDetail(direction, wrap)}
      setDetail={() => undefined}
      closeMediaDetail={url.closeMediaDetail}
      onRequestDelete={() => {
        if (presentation.selectedMediaId && scope.type === "PERSONAL") {
          setDeleteTarget(presentation.selectedMediaId)
          setDeleteError(false)
        }
      }}
      allowDelete={scope.type === "PERSONAL"}
      stateItems={[]}
      compact={compact}
      context={scope.type === "COMMUNITY" ? "community" : "personal"}
      downloadMock="forbidden"
      detailValues={editing.detailValues}
      detailSectionsExpanded={editing.detailSectionsExpanded}
      toggleDetailSection={editing.toggleDetailSection}
      openDetailEditor={editing.openDetailEditor}
      setUnshareTarget={editing.setUnshareTarget}
      setShareTarget={editing.setShareTarget}
      setDetailEditor={editing.setDetailEditor}
      prepareNavigation={viewport.prepareNavigation}
      detailInfoOpened={viewport.detailInfoOpened}
      setDetailInfoOpened={viewport.setDetailInfoOpened}
      detailZoom={viewport.detailZoom}
      setDetailZoom={viewport.setDetailZoom}
      detailRotate={viewport.detailRotate}
      setDetailRotate={viewport.setDetailRotate}
      detailRotateAnimated={viewport.detailRotateAnimated}
      setDetailRotateAnimated={viewport.setDetailRotateAnimated}
      detailDirection={viewport.detailDirection}
      read={{
        detail: presentation.detail,
        preview: presentation.preview,
        groups: presentation.groups,
        tags: presentation.tags,
        retryDetail: presentation.retryDetail,
        retryImage: presentation.retryDetail,
        pollingStopped: presentation.pollingStopped,
      }}
    />
    <Modal opened={deleteTarget !== null} onClose={() => {
      if (!deleting) { setDeleteTarget(null); deletionKey.current = null }
    }} title="Mediaを削除" size="md">
      <Modal.Body>
        <Text size="sm">このMediaを削除します。削除したMediaは復元できません。</Text>
        {deleteError && <Text size="sm" c="red" role="alert">削除結果を確認できませんでした。最新の状態を確認してから再試行してください。</Text>}
      </Modal.Body>
      <Modal.Footer>
        <Group justify="flex-end">
          <Button variant="default" disabled={deleting} onClick={() => {
            setDeleteTarget(null)
            deletionKey.current = null
          }}>キャンセル</Button>
          <Button color="red" loading={deleting} onClick={() => void deleteConfirmed()}>削除</Button>
        </Group>
      </Modal.Footer>
    </Modal>
    </>
  )
}
