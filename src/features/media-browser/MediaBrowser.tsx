"use client"

import {
  Alert,
  Box,
  Button,
  Center,
  Divider,
  Group,
  Loader,
  MultiSelect,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import {
  IconAlertCircle,
  IconCloudUpload,
  IconPhoto,
  IconTags,
} from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Dialog } from "@/components/Dialog"
import { showNotification } from "@/components/Feedback"
import { MediaDetailDialog, type MediaItem } from "@/features/media-detail"
import { MediaTile } from "./MediaTile"
import { MediaBrowserToolbar } from "./MediaBrowserToolbar"

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

function MediaBrowserContent({
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
      {
        <Box
          w="100%"
          h="calc(100vh - 88px)"
          style={{ display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0, overflow: "hidden" }}
        >
          <MediaBrowserToolbar
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
          />
          <Divider />
          <ScrollArea flex={1} style={{ minHeight: 0 }}>
          {activeState === "loading" && (
            <Center mih={360}>
              <Stack align="center">
                <Loader />
                <Text size="sm" c="dimmed">
                  Mediaを読み込んでいます
                </Text>
              </Stack>
            </Center>
          )}
          {activeState === "error" && (
            <Alert
              icon={<IconAlertCircle size={18} />}
              title="Mediaを読み込めませんでした"
              color="red"
            >
              <Group justify="space-between">
                <Text size="sm">
                  通信状態を確認して、もう一度お試しください。
                </Text>
                <Button size="xs" variant="default" onClick={onRetry}>
                  再試行
                </Button>
              </Group>
            </Alert>
          )}
          {activeState === "true-empty" && (
            <Center mih={360}>
              <Stack align="center" maw={420}>
                <ThemeIcon size={48} radius="xl" variant="light">
                  <IconPhoto size={24} />
                </ThemeIcon>
                <Text fw={700} size="lg">
                  まだMediaがありません
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                  {context === "personal"
                    ? "最初のMediaをアップロードすると、ここから閲覧・整理できます。"
                    : "CommunityへMediaを追加すると、ここから閲覧・整理できます。"}
                </Text>
                <Button
                  leftSection={<IconCloudUpload size={16} />}
                  onClick={
                    items
                      ? () =>
                          navigate(
                            context === "personal"
                              ? "/media/upload"
                              : `/communities/${communityId}/media/upload`,
                          )
                      : undefined
                  }
                >
                  {context === "personal"
                    ? "Mediaをアップロード"
                    : "Mediaを追加"}
                </Button>
              </Stack>
            </Center>
          )}
          {activeState === "filtered-empty" && (
            <Center mih={360}>
              <Stack align="center" maw={420}>
                <ThemeIcon size={48} radius="xl" variant="light" color="gray">
                  <IconTags size={24} />
                </ThemeIcon>
                <Text fw={700} size="lg">
                  一致するMediaがありません
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                  選択中のTagを変更するか、filterを解除してください。
                </Text>
                <Button
                  variant="default"
                  onClick={() => {
                    setTags([])
                    setAppliedTags([])
                    onApplyTags?.([])
                  }}
                >
                  Filterを解除
                </Button>
              </Stack>
            </Center>
          )}

          {activeState !== "error" &&
            activeState !== "loading" &&
            stateItems.length > 0 && (
              <Box
                p={3}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(min(168px, 100%), 1fr))",
                  gap: "var(--mantine-spacing-xs)",
                }}
              >
                {stateItems.map((item) => (
                  <MediaTile
                    key={item.id}
                    item={item}
                    selecting={selecting}
                    selected={selected.has(item.id)}
                    onClick={() => {
                      if (selecting) {
                        toggle(item.id)
                        return
                      }
                      if (!items) setDetail(item)
                    }}
                  />
                ))}
              </Box>
            )}
          {activeState !== "error" &&
            hasMore &&
            !loadingMore &&
            !loadMoreError && (
              <Center py="md">
                <Button size="xs" variant="default" onClick={onLoadMore}>
                  さらに読み込む
                </Button>
              </Center>
            )}
          {(loadingMore || activeState === "loading-more") && (
            <Center py="md">
              <Group gap="xs">
                <Loader size="sm" />
                <Text size="sm" c="dimmed">
                  さらに読み込んでいます
                </Text>
              </Group>
            </Center>
          )}
          {(loadMoreError || activeState === "load-more-error") && (
            <Paper withBorder radius="md" p="sm">
              <Group justify="space-between">
                <Group gap="xs">
                  <IconAlertCircle size={18} />
                  <Text size="sm">続きのMediaを読み込めませんでした</Text>
                </Group>
                <Button size="xs" variant="default" onClick={onLoadMore}>
                  再試行
                </Button>
              </Group>
            </Paper>
          )}
          </ScrollArea>
        </Box>
      }

      <Dialog
        opened={selectionDialog === "group"}
        onClose={() => {
          if (!groupActionPending) {
            setSelectionDialog(null)
            onDismissGroupActionResult?.()
          }
        }}
        title="Groupに追加"
        size="md"
        footer={
          <Dialog.Footer
            secondary={
              <Button
                variant="default"
                disabled={groupActionPending}
                onClick={() => {
                  setSelectionDialog(null)
                  onDismissGroupActionResult?.()
                }}
              >
                {groupActionResult ? "結果を閉じる" : "キャンセル"}
              </Button>
            }
            primary={
              <Button
                disabled={
                  groupTargets.length === 0 ||
                  groupActionPending ||
                  selected.size === 0
                }
                loading={groupActionPending}
                onClick={() => void addToGroups()}
              >
                {groupActionResult ? "失敗したMediaを再試行" : "追加"}
              </Button>
            }
          />
        }
      >
        <Stack gap="xs">
          <Text size="sm">
            {selected.size}件のMediaを選択したすべてのGroupに追加します。
          </Text>
          {groupActionError && (
            <Alert color="red" role="alert">
              <Group justify="space-between">
                <Text size="sm">{groupActionError}</Text>
                {onRetryGroupOptions && (
                  <Button
                    size="xs"
                    variant="default"
                    onClick={onRetryGroupOptions}
                  >
                    再試行
                  </Button>
                )}
              </Group>
            </Alert>
          )}
          {groupActionResult && (
            <Stack gap="xs">
              <Text size="sm">
                追加成功: {groupActionResult.succeeded}件 / 既に追加済み:{" "}
                {groupActionResult.alreadyApplied}件 / 失敗:{" "}
                {groupActionResult.failed.length}件
              </Text>
              {groupActionResult.failed.map((item) => (
                <Text key={item.mediaId} size="sm" c="red">
                  {stateItems.find((media) => media.id === item.mediaId)
                    ?.label ?? item.mediaId}
                  ：
                  {item.errorCode === "NOT_FOUND"
                    ? "Mediaが利用できません"
                    : "追加できませんでした"}
                </Text>
              ))}
            </Stack>
          )}
          <MultiSelect
            label="Group"
            placeholder="Groupを選択"
            searchable
            data={groupOptions ?? ["旅行", "家族", "風景写真", "お気に入り"]}
            value={groupTargets}
            onChange={(value) => {
              setGroupTargets(value)
              onDismissGroupActionResult?.()
            }}
          />
        </Stack>
      </Dialog>

      <Dialog
        opened={selectionDialog === "share"}
        onClose={() => setSelectionDialog(null)}
        title="Communityへ共有"
        size="md"
        footer={
          <Dialog.Footer
            secondary={
              <Button
                variant="default"
                onClick={() => setSelectionDialog(null)}
              >
                キャンセル
              </Button>
            }
            primary={
              <Button
                disabled={!communityTarget}
                onClick={() => setSelectionDialog(null)}
              >
                共有
              </Button>
            }
          />
        }
      >
        <Stack gap="xs">
          <Stack gap={4}>
            <Text size="sm">
              {selected.size}
              件の選択Mediaから、共有可能なUser管理Mediaを1つのCommunityへ共有します。
            </Text>
            <Text size="xs" c="dimmed">
              Community管理Mediaや、選択した共有先へすでに共有済みのMediaには新しい共有関係を作成しません。
            </Text>
          </Stack>
          <Select
            label="Community"
            placeholder="Communityを選択"
            data={["Photo Club", "Family Archive", "Travel Team"]}
            value={communityTarget}
            onChange={setCommunityTarget}
          />
        </Stack>
      </Dialog>

      <Dialog
        opened={selectionDialog === "delete"}
        onClose={() => setSelectionDialog(null)}
        title="Mediaを削除"
        size="md"
        footer={
          <Dialog.Footer
            secondary={
              <Button
                variant="default"
                onClick={() => setSelectionDialog(null)}
              >
                キャンセル
              </Button>
            }
            primary={
              <Button
                color="red"
                onClick={() => completeMockSelection("delete")}
              >
                削除
              </Button>
            }
          />
        }
      >
        <Text size="sm">
          選択した{selected.size}
          件のMediaを削除します。削除したMediaは復元できません。
        </Text>
      </Dialog>

      {detail && (
        <MediaDetailDialog
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
  props: Omit<Parameters<typeof MediaBrowserContent>[0], "navigate">,
) {
  const router = useRouter()
  return (
    <MediaBrowserContent {...props} navigate={(path) => router.push(path)} />
  )
}
