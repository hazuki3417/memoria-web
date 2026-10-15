"use client"

import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Center,
  Checkbox,
  Collapse,
  Combobox,
  Divider,
  Group,
  Image,
  InputBase,
  Loader,
  Menu,
  Modal,
  MultiSelect,
  Paper,
  SegmentedControl,
  Select,
  Slider,
  Stack,
  TagsInput,
  Text,
  ThemeIcon,
  useCombobox,
} from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import {
  IconAlertCircle,
  IconCheckbox,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconCloudUpload,
  IconDownload,
  IconEdit,
  IconEye,
  IconFolderPlus,
  IconInfoCircle,
  IconPhoto,
  IconPhotoOff,
  IconPlus,
  IconRotate,
  IconRotate2,
  IconSearch,
  IconShare,
  IconTags,
  IconTrash,
  IconX,
  IconZoomIn,
  IconZoomOut,
  IconZoomReset,
} from "@tabler/icons-react"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Dialog } from "@/components/Dialog"
import { showNotification } from "@/components/Feedback"
import { useImageDetailViewport } from "@/features/media-browser/useImageDetailViewport"
import { useImageDetailEditing } from "@/features/media-browser/useImageDetailEditing"
import { ImageDetailEditingDialogs } from "@/features/media-browser/ImageDetailEditingDialogs"
import { ImageDetailViewer } from "@/features/media-browser/ImageDetailViewer"

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
export type MediaItem = {
  id: string
  label: string
  src: string
  failed?: boolean
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

function MediaTile({
  item,
  selecting,
  selected,
  onClick,
}: {
  item: MediaItem
  selecting: boolean
  selected: boolean
  onClick: () => void
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      aria-label={
        selecting
          ? `${item.label}を${selected ? "選択解除" : "選択"}`
          : `${item.label}を開く`
      }
      aria-pressed={selecting ? selected : undefined}
      w="100%"
      p={0}
      bdrs="md"
      style={{
        position: "relative",
        aspectRatio: "1 / 1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        border: "1px solid var(--mantine-color-default-border)",
        outline: selected
          ? "2px solid var(--mantine-color-blue-6)"
          : "2px solid transparent",
        outlineOffset: "-2px",
        background: "var(--mantine-color-gray-0)",
        boxShadow: selected
          ? "0 0 0 2px var(--mantine-color-blue-light)"
          : undefined,
        cursor: "pointer",
        transition: "box-shadow 120ms ease, transform 120ms ease",
        userSelect: "none",
      }}
    >
      {item.failed ? (
        <Stack align="center" justify="center" gap={6} p="sm" c="dimmed">
          <IconPhotoOff size={30} stroke={1.5} aria-hidden="true" />
          <Text size="xs" fw={600} ta="center">
            画像を表示できません
          </Text>
          <Text size="10px" ta="center">
            処理に失敗しました
          </Text>
        </Stack>
      ) : (
        <Image
          src={item.src}
          alt={item.label}
          w="100%"
          h="100%"
          fit="cover"
          draggable={false}
        />
      )}

      {selecting && (
        <Box
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: selected ? "rgba(34, 139, 230, 0.08)" : "transparent",
          }}
        />
      )}

      {selecting && (
        <Checkbox
          checked={selected}
          readOnly
          size="sm"
          color="blue"
          aria-hidden="true"
          tabIndex={-1}
          styles={{
            input: {
              backgroundColor: selected ? undefined : "transparent",
              borderColor: selected ? undefined : "rgba(255, 255, 255, 0.92)",
              boxShadow: selected ? undefined : "0 1px 3px rgba(0, 0, 0, 0.45)",
            },
          }}
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            pointerEvents: "none",
          }}
        />
      )}
    </Box>
  )
}

function MediaBrowserContent({
  initialState = "default",
  contextKind = "personal",
  initialDialog = null,
  communityId = "photo-club",
  downloadMock = "available",
  detailOnlyItems,
  initialDetailId,
  onDetailClose,
  navigate,
}: {
  initialState?: MediaBrowserState
  contextKind?: ContextKind
  initialDialog?: SelectionDialog
  communityId?: string
  downloadMock?: "available" | "forbidden" | "processing"
  detailOnlyItems?: MediaItem[]
  initialDetailId?: string
  onDetailClose?: () => void
  navigate: (path: string) => void
}) {
  const [context, _setContext] = useState(contextKind)
  const compact = useMediaQuery("(max-width: 47.99em)")
  const [selecting, setSelecting] = useState(initialState === "selection")
  const [selected, setSelected] = useState<Set<string>>(
    initialState === "selection" ? new Set(["2", "5", "7"]) : new Set(),
  )
  const [detail, setDetail] = useState<MediaItem | null>(
    () => detailOnlyItems?.find((item) => item.id === initialDetailId) ?? null,
  )
  const closeImageDetail = () => {
    setDetail(null)
    onDetailClose?.()
  }
  useEffect(() => {
    if (detailOnlyItems) {
      setDetail(
        detailOnlyItems.find((item) => item.id === initialDetailId) ?? null,
      )
    }
  }, [initialDetailId, detailOnlyItems])

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
  } = useImageDetailEditing(detail)
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
  } = useImageDetailViewport()
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
      message:
        kind === "group"
          ? `${count}件のMediaを${groupTargets.length}件のGroup（${groupTargets.join("、")}）へ追加する操作を確認しました。実際のデータは変更されていません。`
          : `${count}件のMediaを削除する操作を確認しました。実際のデータは削除されていません。`,
    })
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
  const stateItems =
    detailOnlyItems ??
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
      {!detailOnlyItems && (
        <Stack gap={0} w="100%">
          <Box
            pb="xs"
            style={{
              display: "grid",
              gridTemplateColumns: compact
                ? "minmax(0, 1fr)"
                : "minmax(0, 1fr) auto",
              alignItems: "center",
              gap: "var(--mantine-spacing-xs)",
            }}
          >
            <Box style={{ minWidth: 0 }}>
              {!selecting ? (
                <Box
                  component="form"
                  onSubmit={(event) => {
                    event.preventDefault()
                    setAppliedTags([...tags])
                  }}
                >
                  <Group gap="xs" wrap="nowrap">
                    <TagsInput
                      placeholder="Tagを検索"
                      value={tags}
                      onChange={setTags}
                      clearable
                      leftSection={<IconSearch size={16} />}
                      size="xs"
                      w={compact ? "100%" : 280}
                      maw="100%"
                      style={{ flex: compact ? "1 1 auto" : undefined }}
                      comboboxProps={{ withinPortal: true }}
                    />
                    <Button size="xs" type="submit" style={{ flexShrink: 0 }}>
                      検索
                    </Button>
                    <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
                      {stateItems.length}件
                    </Text>
                  </Group>
                </Box>
              ) : (
                <Badge size="lg" variant="light">
                  {selected.size}件選択
                </Badge>
              )}
            </Box>

            <Group
              gap="xs"
              justify="flex-end"
              wrap="nowrap"
              style={{ gridColumn: compact ? "1" : undefined }}
            >
              {selecting && (
                <>
                  <Button
                    size="xs"
                    variant="default"
                    leftSection={<IconEdit size={15} />}
                    disabled={selected.size === 0}
                    onClick={() =>
                      navigate(
                        context === "community"
                          ? `/communities/${communityId}/media/edit`
                          : "/media/edit",
                      )
                    }
                  >
                    編集
                  </Button>
                  <Button
                    size="xs"
                    variant="default"
                    leftSection={<IconFolderPlus size={15} />}
                    disabled={selected.size === 0}
                    onClick={() => setSelectionDialog("group")}
                  >
                    Group
                  </Button>
                  {context === "personal" && (
                    <Button
                      size="xs"
                      variant="default"
                      leftSection={<IconShare size={15} />}
                      disabled={selected.size === 0}
                      onClick={() => setSelectionDialog("share")}
                    >
                      共有
                    </Button>
                  )}
                  <Button
                    size="xs"
                    variant="default"
                    color="red"
                    leftSection={<IconTrash size={15} />}
                    disabled={selected.size === 0}
                    onClick={() => setSelectionDialog("delete")}
                  >
                    削除
                  </Button>
                </>
              )}
              {!selecting &&
                (context === "personal" ? (
                  <Button
                    size="xs"
                    leftSection={<IconCloudUpload size={16} />}
                    onClick={() => navigate("/media/upload")}
                  >
                    アップロード
                  </Button>
                ) : (
                  <Menu position="bottom-end">
                    <Menu.Target>
                      <Button
                        size="xs"
                        rightSection={<IconChevronDown size={14} />}
                        leftSection={<IconPlus size={16} />}
                      >
                        Mediaを追加
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconCloudUpload size={16} />}
                        onClick={() =>
                          navigate(`/communities/${communityId}/media/upload`)
                        }
                      >
                        Communityへアップロード
                      </Menu.Item>
                      <Menu.Item leftSection={<IconShare size={16} />}>
                        Personal Mediaから共有
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                ))}
              <SegmentedControl
                size="xs"
                value={selecting ? "select" : "view"}
                onChange={(value) => {
                  if (value === "select") {
                    setSelecting(true)
                    return
                  }
                  endSelection()
                }}
                data={[
                  {
                    value: "view",
                    label: (
                      <Center style={{ gap: 6 }}>
                        <IconEye size={15} />
                        <span>View</span>
                      </Center>
                    ),
                  },
                  {
                    value: "select",
                    label: (
                      <Center style={{ gap: 6 }}>
                        <IconCheckbox size={15} />
                        <span>Select</span>
                      </Center>
                    ),
                  },
                ]}
              />
            </Group>
          </Box>
          <Divider />

          {initialState === "loading" && (
            <Center mih={360}>
              <Stack align="center">
                <Loader />
                <Text size="sm" c="dimmed">
                  Mediaを読み込んでいます
                </Text>
              </Stack>
            </Center>
          )}
          {initialState === "error" && (
            <Alert
              icon={<IconAlertCircle size={18} />}
              title="Mediaを読み込めませんでした"
              color="red"
            >
              <Group justify="space-between">
                <Text size="sm">
                  通信状態を確認して、もう一度お試しください。
                </Text>
                <Button size="xs" variant="default">
                  再試行
                </Button>
              </Group>
            </Alert>
          )}
          {initialState === "true-empty" && (
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
                <Button leftSection={<IconCloudUpload size={16} />}>
                  {context === "personal"
                    ? "Mediaをアップロード"
                    : "Mediaを追加"}
                </Button>
              </Stack>
            </Center>
          )}
          {initialState === "filtered-empty" && (
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
                <Button variant="default" onClick={() => setTags([])}>
                  Filterを解除
                </Button>
              </Stack>
            </Center>
          )}

          {stateItems.length > 0 && (
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
                    setDetailZoom(100)
                    setDetailRotate(0)
                    setDetail(item)
                  }}
                />
              ))}
            </Box>
          )}
          {initialState === "loading-more" && (
            <Center py="md">
              <Group gap="xs">
                <Loader size="sm" />
                <Text size="sm" c="dimmed">
                  さらに読み込んでいます
                </Text>
              </Group>
            </Center>
          )}
          {initialState === "load-more-error" && (
            <Paper withBorder radius="md" p="sm">
              <Group justify="space-between">
                <Group gap="xs">
                  <IconAlertCircle size={18} />
                  <Text size="sm">続きのMediaを読み込めませんでした</Text>
                </Group>
                <Button size="xs" variant="default">
                  再試行
                </Button>
              </Group>
            </Paper>
          )}
        </Stack>
      )}

      <Dialog
        opened={selectionDialog === "group"}
        onClose={() => setSelectionDialog(null)}
        title="Groupに追加"
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
                disabled={groupTargets.length === 0}
                onClick={() => completeMockSelection("group")}
              >
                追加
              </Button>
            }
          />
        }
      >
        <Stack gap="xs">
          <Text size="sm">
            {selected.size}件のMediaを選択したすべてのGroupに追加します。
          </Text>
          <MultiSelect
            label="Group"
            placeholder="Groupを選択"
            searchable
            data={["旅行", "家族", "風景写真", "お気に入り"]}
            value={groupTargets}
            onChange={setGroupTargets}
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

      <ImageDetailViewer
        detail={detail}
        setDetail={setDetail}
        closeImageDetail={closeImageDetail}
        stateItems={stateItems}
        compact={compact}
        context={context}
        downloadMock={downloadMock}
        detailValues={detailValues}
        detailSectionsExpanded={detailSectionsExpanded}
        toggleDetailSection={toggleDetailSection}
        openDetailEditor={openDetailEditor}
        setUnshareTarget={setUnshareTarget}
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
      <ImageDetailEditingDialogs
        unshareTarget={unshareTarget}
        setUnshareTarget={setUnshareTarget}
        removeCommunityShare={removeCommunityShare}
        detailEditor={detailEditor}
        setDetailEditor={setDetailEditor}
        detailValues={detailValues}
        shareTarget={shareTarget}
        setShareTarget={setShareTarget}
        addCommunityShare={addCommunityShare}
        detailDraft={detailDraft}
        setDetailDraft={setDetailDraft}
        saveDetailDraft={saveDetailDraft}
      />
    </>
  )
}

/** Route integration stays outside the reusable image-detail rendering path. */
function RoutedMediaBrowser(
  props: Omit<Parameters<typeof MediaBrowserContent>[0], "navigate">,
) {
  const router = useRouter()
  return (
    <MediaBrowserContent {...props} navigate={(path) => router.push(path)} />
  )
}

/**
 * The detail-only consumer must not require the Next.js App Router.
 * Media Browser's list actions retain their original Next.js navigation.
 */
export function MediaBrowser(
  props: Omit<Parameters<typeof MediaBrowserContent>[0], "navigate">,
) {
  if (props.detailOnlyItems) {
    return <MediaBrowserContent {...props} navigate={() => undefined} />
  }
  return <RoutedMediaBrowser {...props} />
}
