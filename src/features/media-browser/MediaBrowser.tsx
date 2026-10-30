"use client"

import { useMediaQuery } from "@mantine/hooks"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { showNotification } from "@/components/Feedback"
import { MediaDetailModal, type MediaItem } from "@/features/media-detail"
import { MediaBrowserPane } from "./MediaBrowserPane"
import { MediaBrowserGroupModal } from "./MediaBrowserGroupModal"
import { MediaBrowserShareModal } from "./MediaBrowserShareModal"
import { MediaBrowserDeleteModal } from "./MediaBrowserDeleteModal"

type MediaBrowserState =
  | "default"
  | "tag-filtered"
  | "true-empty"
  | "filtered-empty"
  | "loading"
  | "error"
  | "loading-more"
  | "load-more-error"
  | "processing-failure"
  | "selection"
type ContextKind = "personal" | "community"
type SelectionDialog = "group" | "share" | "delete" | null
export type GroupActionResult = {
  succeeded: number
  alreadyApplied: number
  failed: { mediaId: string; errorCode: string | null }[]
}
const media: MediaItem[] = [
  {
    id: "portrait-01",
    label: "縦長 Media 1",
    src: "/__dev-assets/media-browser/h-01.png",
  },
  {
    id: "portrait-02",
    label: "縦長 Media 2",
    src: "/__dev-assets/media-browser/h-02.png",
  },
  {
    id: "landscape-01",
    label: "横長 Media 1",
    src: "/__dev-assets/media-browser/w-01.png",
  },
  {
    id: "landscape-02",
    label: "横長 Media 2",
    src: "/__dev-assets/media-browser/w-02.png",
  },
  ...Array.from({ length: 8 }, (_, index) => ({
    id: String(index + 1),
    label: `Media ${index + 1}`,
    src: `/__dev-assets/group-browser/group-media-${String((index % 9) + 1).padStart(2, "0")}.jpg`,
  })),
]
media.push({ id: "failed", label: "画像処理失敗", src: "", failed: true })
const _contexts = [
  {
    id: "personal",
    kind: "personal" as const,
    label: "Personal",
    accentColor: "var(--mantine-color-blue-6)",
  },
  {
    id: "community",
    kind: "community" as const,
    label: "Photo Club",
    accentColor: "var(--mantine-color-violet-6)",
  },
]

function MediaBrowserController({
  initialState = "default",
  contextKind = "personal",
  initialDialog = null,
  communityId = "photo-club",
  downloadMock = "available",
  navigate,
  items,
  listState,
  onRetry,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
  loadMoreError = false,
  tagOptions,
  onApplyTags,
  filterResetKey,
  groupOptions,
  onAddToGroups,
  groupActionPending = false,
  groupActionError,
  onRetryGroupOptions,
  groupActionResult,
  onDismissGroupActionResult,
  onOpenMediaDetail,
}: {
  initialState?: MediaBrowserState
  contextKind?: ContextKind
  initialDialog?: SelectionDialog
  communityId?: string
  downloadMock?: "available" | "forbidden" | "processing"
  navigate: (path: string) => void
  items?: MediaItem[]
  listState?: MediaBrowserState
  onRetry?: () => void
  onLoadMore?: () => void
  hasMore?: boolean
  loadingMore?: boolean
  loadMoreError?: boolean
  tagOptions?: string[]
  onApplyTags?: (names: string[]) => void
  filterResetKey?: string
  groupOptions?: { value: string; label: string }[]
  onAddToGroups?: (mediaIds: string[], groupIds: string[]) => Promise<boolean>
  groupActionPending?: boolean
  groupActionError?: string | null
  onRetryGroupOptions?: () => void
  groupActionResult?: GroupActionResult | null
  onDismissGroupActionResult?: () => void
  /** Optional URL-controller handoff; absent for existing local Modal consumers. */
  onOpenMediaDetail?: (mediaId: string, orderedLoadedMediaIds: readonly string[]) => void
}) {
  const [context, _setContext] = useState(contextKind)
  const compact = useMediaQuery("(max-width: 47.99em)")
  const [selecting, setSelecting] = useState(initialState === "selection")
  const [selected, setSelected] = useState<Set<string>>(
    initialState === "selection" ? new Set(["2", "5", "7"]) : new Set(),
  )
  const [detail, setDetail] = useState<MediaItem | null>(null)
  // A changed Media query must never keep selections from the former filter.
  // Prototype stories omit this prop, preserving their existing state model.
  useEffect(() => {
    if (filterResetKey === undefined) return
    setSelected(new Set())
    setSelecting(false)
  }, [filterResetKey])
  const [selectionDialog, setSelectionDialog] =
    useState<SelectionDialog>(initialDialog)
  const [groupTargets, setGroupTargets] = useState<string[]>([])
  const completeMockSelection = (kind: "group" | "delete") => {
    const count = selected.size
    if (!count || (kind === "group" && groupTargets.length === 0)) return
    setSelectionDialog(null)
    showNotification({
      kind: "info",
      title: kind === "group" ? "Groupへの追加" : "Mediaの削除",
      description:
        kind === "group"
          ? `${count}件のMediaを${groupTargets.length}件のGroup（${groupTargets.join("、")}）へ追加する操作を確認しました。実際のデータは変更されていません。`
          : `${count}件のMediaを削除する操作を確認しました。実際のデータは削除されていません。`,
    })
  }
  const addToGroups = async () => {
    if (!onAddToGroups) {
      completeMockSelection("group")
      return
    }
    if (selected.size === 0 || groupTargets.length === 0 || groupActionPending)
      return
    const targetIds = groupActionResult?.failed.map((item) => item.mediaId) ?? [
      ...selected,
    ]
    if (targetIds.length === 0) return
    if (await onAddToGroups(targetIds, groupTargets)) {
      setSelectionDialog(null)
      setGroupTargets([])
      onDismissGroupActionResult?.()
      endSelection()
    }
  }
  const [communityTarget, setCommunityTarget] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>(
    initialState === "tag-filtered" || initialState === "filtered-empty"
      ? ["旅行"]
      : [],
  )
  const [appliedTags, setAppliedTags] = useState<string[]>(tags)
  // The mock has no tag metadata or Relay connection; keep the submitted filter separate.
  void appliedTags
  const activeState = listState ?? initialState
  const stateItems =
    items ??
    (["true-empty", "filtered-empty", "loading", "error"].includes(initialState)
      ? []
      : initialState === "processing-failure"
        ? [...media.slice(0, 5), media[media.length - 1]]
        : media.slice(0, 12))

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  const endSelection = () => {
    setSelected(new Set())
    setSelecting(false)
  }

  return (
    <>
      <MediaBrowserPane
        compact={compact}
        selecting={selecting}
        selected={selected}
        tags={tags}
        setTags={setTags}
        onSubmitTags={() => {
          setAppliedTags([...tags])
          onApplyTags?.([...tags])
        }}
        tagOptions={tagOptions}
        context={context}
        communityId={communityId}
        hasRemoteItems={Boolean(items)}
        navigate={navigate}
        onSelectionDialog={setSelectionDialog}
        onStartSelection={() => setSelecting(true)}
        onEndSelection={endSelection}
        activeState={activeState}
        items={stateItems}
        onToggle={toggle}
        onOpenDetail={(item) => {
          if (onOpenMediaDetail) {
            onOpenMediaDetail(item.id, stateItems.map(({ id }) => id))
          } else {
            setDetail(item)
          }
        }}
        onClearTags={() => {
          setTags([])
          setAppliedTags([])
          onApplyTags?.([])
        }}
        onRetry={onRetry}
        onLoadMore={onLoadMore}
        hasMore={hasMore}
        loadingMore={loadingMore}
        loadMoreError={loadMoreError}
      />

      <MediaBrowserGroupModal
        opened={selectionDialog === "group"}
        selected={selected}
        groupActionPending={groupActionPending}
        groupActionResult={groupActionResult}
        groupActionError={groupActionError}
        onRetryGroupOptions={onRetryGroupOptions}
        onDismissGroupActionResult={onDismissGroupActionResult}
        groupTargets={groupTargets}
        onTargetsChange={setGroupTargets}
        groupOptions={groupOptions}
        items={stateItems}
        onClose={() => setSelectionDialog(null)}
        onAddToGroups={addToGroups}
      />
      <MediaBrowserShareModal
        opened={selectionDialog === "share"}
        selectedCount={selected.size}
        communityTarget={communityTarget}
        onTargetChange={setCommunityTarget}
        onClose={() => setSelectionDialog(null)}
      />
      <MediaBrowserDeleteModal
        opened={selectionDialog === "delete"}
        selectedCount={selected.size}
        onClose={() => setSelectionDialog(null)}
        onDelete={() => completeMockSelection("delete")}
      />

      {detail && (
        <MediaDetailModal
          items={stateItems}
          initialId={detail.id}
          onClose={() => setDetail(null)}
          contextKind={context}
          downloadMock={downloadMock}
        />
      )}
    </>
  )
}

/** Route integration for the Media listing. */
export function MediaBrowser(
  props: Omit<Parameters<typeof MediaBrowserController>[0], "navigate">,
) {
  const router = useRouter()
  return (
    <MediaBrowserController {...props} navigate={(path) => router.push(path)} />
  )
}
