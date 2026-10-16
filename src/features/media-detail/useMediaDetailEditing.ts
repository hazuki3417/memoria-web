"use client"

import { useState } from "react"
import { showNotification } from "@/components/Feedback"
import type { MediaItem } from "@/features/media-detail/types"

/** Image detail edit, share and section state; independent of the listing UI. */
export function useMediaDetailEditing(detail: MediaItem | null) {
  const [detailEditor, setDetailEditor] = useState<
    "tags" | "groups" | "communities" | null
  >(null)
  const [detailDraft, setDetailDraft] = useState<string[]>([])
  const [shareTarget, setShareTarget] = useState<string | null>(null)
  const [unshareTarget, setUnshareTarget] = useState<string | null>(null)
  const [detailEdits, setDetailEdits] = useState<
    Record<string, { tags: string[]; groups: string[]; communities: string[] }>
  >({})
  const detailValues = detailEdits[detail?.id ?? ""] ?? {
    tags: ["旅行", "風景"],
    groups: ["旅行", "お気に入り"],
    communities: ["Photo Club"],
  }
  const openDetailEditor = (kind: "tags" | "groups" | "communities") => {
    setDetailDraft([...detailValues[kind]])
    setDetailEditor(kind)
  }
  const saveDetailDraft = () => {
    if (!detail || !detailEditor) return
    setDetailEdits((current) => ({
      ...current,
      [detail.id]: { ...detailValues, [detailEditor]: [...detailDraft] },
    }))
    const label =
      detailEditor === "tags"
        ? "Tags"
        : detailEditor === "groups"
          ? "Groups"
          : "共有先Community"
    setDetailEditor(null)
    showNotification({
      kind: "success",
      title: `${label}を更新しました`,
      message: "画面上の変更を反映しました。サーバーには保存されていません。",
    })
  }
  const addCommunityShare = () => {
    if (
      !detail ||
      !shareTarget ||
      detailValues.communities.includes(shareTarget)
    )
      return
    setDetailEdits((current) => ({
      ...current,
      [detail.id]: {
        ...detailValues,
        communities: [...detailValues.communities, shareTarget],
      },
    }))
    setShareTarget(null)
    setDetailEditor(null)
    showNotification({
      kind: "success",
      title: "Communityへ共有しました",
      message: "画面上の共有先に追加しました。サーバーには保存されていません。",
    })
  }
  const removeCommunityShare = () => {
    if (
      !detail ||
      !unshareTarget ||
      !detailValues.communities.includes(unshareTarget)
    )
      return
    setDetailEdits((current) => ({
      ...current,
      [detail.id]: {
        ...detailValues,
        communities: detailValues.communities.filter(
          (name) => name !== unshareTarget,
        ),
      },
    }))
    setUnshareTarget(null)
    showNotification({
      kind: "success",
      title: "Communityの共有を解除しました",
      message:
        "画面上の共有先から解除しました。サーバーには保存されていません。",
    })
  }
  const [detailSectionsExpanded, setDetailSectionsExpanded] = useState<
    Record<"groups" | "tags" | "communities", boolean>
  >({ groups: false, tags: false, communities: false })
  const toggleDetailSection = (kind: "groups" | "tags" | "communities") =>
    setDetailSectionsExpanded((current) => ({
      ...current,
      [kind]: !current[kind],
    }))
  return {
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
  }
}
