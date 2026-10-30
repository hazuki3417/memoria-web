"use client"

import { useMediaQuery } from "@mantine/hooks"
import { useEffect, useRef } from "react"
import { MediaDetailViewer } from "./MediaDetailViewer"
import { useMediaDetailEditing } from "./useMediaDetailEditing"
import { useMediaDetailViewport } from "./useMediaDetailViewport"
import { useMediaDetailPresentation } from "./useMediaDetailPresentation"
import { useMediaDetailUrl } from "./MediaDetailUrlProvider"
import { getMediaNavigation } from "./mediaDetailNavigation"
import type { MediaDetailScope } from "./useMediaDetailRead"

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
    <MediaDetailViewer
      detail={null}
      selectedId={presentation.selectedMediaId}
      navigation={navigation}
      navigateById={(direction) => url.navigateMediaDetail(direction, wrap)}
      setDetail={() => undefined}
      closeMediaDetail={url.closeMediaDetail}
      onRequestDelete={() => undefined}
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
  )
}
