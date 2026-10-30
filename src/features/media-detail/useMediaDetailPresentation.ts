"use client"

import { useMediaDetailUrl } from "./MediaDetailUrlProvider"
import { useMediaDetailRead, type MediaDetailScope } from "./useMediaDetailRead"
import type { DetailReadState, PreviewReadState, CollectionReadState } from "./mediaDetailReadState"

/**
 * Read-only connection between URL selection and independently fetched media.
 *
 * It intentionally does not construct a legacy MediaItem or mount a Viewer:
 * those require an explicit ID-only host contract and permission model.
 * Keeping the identity here prevents thumbnails and stale local selections
 * from being treated as authoritative detail data.
 */
export type MediaDetailPresentation = {
  selectedMediaId: string | null
  detail: DetailReadState
  preview: PreviewReadState
  groups: CollectionReadState
  tags: CollectionReadState
  retryDetail: () => void
}

export function useMediaDetailPresentation(scope: MediaDetailScope): MediaDetailPresentation {
  const { selectedMediaId } = useMediaDetailUrl()
  const read = useMediaDetailRead(selectedMediaId, scope)
  return {
    selectedMediaId,
    detail: read.detail,
    preview: read.preview,
    groups: read.groups,
    tags: read.tags,
    retryDetail: read.retryDetail,
  }
}
