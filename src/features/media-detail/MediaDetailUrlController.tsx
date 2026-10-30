"use client"

import { useMediaQuery } from "@mantine/hooks"
import { MediaDetailViewer } from "./MediaDetailViewer"
import { useMediaDetailEditing } from "./useMediaDetailEditing"
import { useMediaDetailViewport } from "./useMediaDetailViewport"
import { useMediaDetailPresentation } from "./useMediaDetailPresentation"
import { useMediaDetailUrl } from "./MediaDetailUrlProvider"
import type { MediaDetailScope } from "./useMediaDetailRead"

/**
 * Application-level controller for the ORIGINAL Viewer, not an alternative UI.
 * Never enable fixture-only mutation actions for URL/GraphQL selections.
 */
export function MediaDetailUrlController({ scope }: { scope: MediaDetailScope }) {
  const url = useMediaDetailUrl()
  const presentation = useMediaDetailPresentation(scope)
  const viewport = useMediaDetailViewport()
  const editing = useMediaDetailEditing(null)
  const compact = useMediaQuery("(max-width: 47.99em)")

  return (
    <MediaDetailViewer
      detail={null}
      selectedId={presentation.selectedMediaId}
      navigation={url.navigation}
      navigateById={url.navigateMediaDetail}
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
      }}
    />
  )
}
