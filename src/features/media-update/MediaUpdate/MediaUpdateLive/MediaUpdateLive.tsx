"use client"

import { useMediaUpdateDraft } from "../../useMediaUpdateDraft"
import type { MediaUpdateScope } from "../../mediaTagApi"
import { MediaUpdate } from "../MediaUpdate"

export function MediaUpdateLive({
  targets,
  context = "personal",
  communityId = "photo-club",
}: {
  targets: { id: string; label: string; detail: string }[]
  context?: "personal" | "community"
  communityId?: string
}) {
  const scope: MediaUpdateScope =
    context === "personal"
      ? { type: "PERSONAL" }
      : { type: "COMMUNITY", communityId }
  const draft = useMediaUpdateDraft(targets, scope)
  return (
    <MediaUpdate
      context={context}
      communityId={communityId}
      live={{
        items: draft.items,
        status: draft.status,
        changed: draft.changed,
        onChangeTags: draft.updateTags,
        onDiscard: draft.discard,
        onSave: () => {
          void draft.save()
        },
        onReload: () => {
          void draft.reload()
        },
        onRefreshFailed: (id) => {
          void draft.refreshFailed(id)
        },
      }}
    />
  )
}
