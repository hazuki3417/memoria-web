"use client"

import {
  MediaBrowser,
  type MediaItem,
} from "@/features/media-browser/MediaBrowser"

/**
 * Reuses the existing Image Detail viewer and its editing dialogs without
 * changing their visual/behavioral contract. The underlying viewer state is
 * currently hosted by MediaBrowser; extraction into a standalone viewer
 * remains tracked by Issue #91.
 */
export function ImageDetailDialog({
  items,
  initialId,
  onClose,
  contextKind = "personal",
}: {
  items: MediaItem[]
  initialId?: string
  onClose: () => void
  contextKind?: "personal" | "community"
}) {
  return (
    <MediaBrowser
      detailOnlyItems={items}
      initialDetailId={initialId}
      onDetailClose={onClose}
      contextKind={contextKind}
    />
  )
}
