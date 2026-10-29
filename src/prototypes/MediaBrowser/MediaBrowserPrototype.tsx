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
import { Notifications } from "@mantine/notifications"
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
import { useEffect, useState } from "react"
import { getApplicationNavigation } from "@/features/application-shell"
import { MediaBrowserGroupModal } from "@/features/media-browser/MediaBrowserGroupModal"
import { MediaBrowserShareModal } from "@/features/media-browser/MediaBrowserShareModal"
import { MediaBrowserDeleteModal } from "@/features/media-browser/MediaBrowserDeleteModal"
import { CommunityUnshareModal } from "@/features/media-detail/CommunityUnshareModal"
import { CommunityShareModal } from "@/features/media-detail/CommunityShareModal"
import { TagsEditModal } from "@/features/media-detail/TagsEditModal"
import { GroupsEditModal } from "@/features/media-detail/GroupsEditModal"
import { showNotification } from "@/components/Feedback"
import { useMediaDetailViewport } from "@/features/media-detail/useMediaDetailViewport"
import { PrototypeApplicationShell } from "@/prototypes/PrototypeApplicationShell"

type PrototypeState =
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
const contexts = [
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

function ZoomInput({
  value,
  onChange,
}: {
  value: number
  onChange: (value: number) => void
}) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })
  const [input, setInput] = useState(`${value}%`)
  useEffect(() => setInput(`${value}%`), [value])
  const commit = () => {
    const parsed = Number(input.replace(/[^0-9]/g, ""))
    const next = Math.min(
      300,
      Math.max(50, Number.isFinite(parsed) ? parsed : 100),
    )
    onChange(next)
    setInput(`${next}%`)
  }
  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(option) => {
        onChange(Number(option))
        combobox.closeDropdown()
      }}
    >
      <Combobox.Target>
        <InputBase
          size="xs"
          w={76}
          aria-label="拡大率"
          value={input}
          rightSection={<Combobox.Chevron />}
          rightSectionPointerEvents="none"
          onChange={(event) => {
            setInput(
              event.currentTarget.value.replace(/[^0-9%]/g, "").slice(0, 4),
            )
            combobox.openDropdown()
          }}
          onFocus={() => combobox.openDropdown()}
          onClick={() => combobox.openDropdown()}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur()
          }}
        />
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Options mah={200} style={{ overflowY: "auto" }}>
          {Array.from({ length: 26 }, (_, index) => 50 + index * 10).map(
            (level) => (
              <Combobox.Option key={level} value={String(level)}>
                {level}%
              </Combobox.Option>
            ),
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}

export function MediaBrowserPrototype({
  initialState = "default",
  contextKind = "personal",
  initialDialog = null,
  detailMock = "default",
  downloadMock = "available",
  detailOnlyItems,
  initialDetailId,
  onDetailClose,
}: {
  initialState?: PrototypeState
  contextKind?: ContextKind
  initialDialog?: SelectionDialog
  detailMock?: "default" | "many"
  downloadMock?: "available" | "forbidden" | "processing"
  detailOnlyItems?: MediaItem[]
  initialDetailId?: string
  onDetailClose?: () => void
}) {
  const [context, setContext] = useState(contextKind)
  const compact = useMediaQuery("(max-width: 47.99em)")
  const [selecting, setSelecting] = useState(initialState === "selection")
  const [selected, setSelected] = useState<Set<string>>(
    initialState === "selection" ? new Set(["2", "5", "7"]) : new Set(),
  )
  const [detail, setDetail] = useState<MediaItem | null>(
    () => detailOnlyItems?.find((item) => item.id === initialDetailId) ?? null,
  )
  const closeMediaDetail = () => {
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

  const [detailEditor, setDetailEditor] = useState<
    "tags" | "groups" | "communities" | null
  >(null)
  const [detailDraft, setDetailDraft] = useState<string[]>([])
  const [shareTarget, setShareTarget] = useState<string | null>(null)
  const [unshareTarget, setUnshareTarget] = useState<string | null>(null)
  const [detailEdits, setDetailEdits] = useState<
    Record<string, { tags: string[]; groups: string[]; communities: string[] }>
  >({})
  const detailValues =
    detailEdits[detail?.id ?? ""] ??
    (detailMock === "many"
      ? {
          groups: [
            "旅行",
            "お気に入り",
            "家族",
            "2026年",
            "アルバム",
            "風景",
            "とても長い名前のグループを使った表示確認",
            "思い出",
          ],
          tags: [
            "旅行",
            "風景",
            "秋",
            "紅葉",
            "山",
            "自然",
            "写真",
            "休日",
            "家族",
            "散歩",
            "日本",
            "アルバム",
            "長い名前のタグを表示するための例",
            "日記",
          ],
          communities: [
            "Photo Club",
            "Family",
            "Travel",
            "Landscape Photography Community With Long Name",
            "Friends",
            "Memoria Community",
          ],
        }
      : {
          tags: ["旅行", "風景"],
          groups: ["旅行", "お気に入り"],
          communities: ["Photo Club"],
        })
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
      title: `${label}を更新`,
      description:
        "画面上の変更を反映しました。サーバーには保存されていません。",
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
      title: "Communityへ共有",
      description:
        "画面上の共有先に追加しました。サーバーには保存されていません。",
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
      title: "Communityの共有を解除",
      description:
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
  const {
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
  } = useMediaDetailViewport()
  const [selectionDialog, setSelectionDialog] =
    useState<SelectionDialog>(initialDialog)
  const [groupTargets, setGroupTargets] = useState<string[]>([])
  const [communityTarget, setCommunityTarget] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>(
    initialState === "tag-filtered" || initialState === "filtered-empty"
      ? ["旅行"]
      : [],
  )
  const navigationItems = getApplicationNavigation({
    contextKind: context,
    activeSection: "media",
  })
  const currentContext =
    contexts.find((item) => item.kind === context) ?? contexts[0]
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
    <PrototypeApplicationShell
      currentContext={currentContext}
      contexts={contexts}
      navigationItems={navigationItems}
      user={{ displayName: "Hazuki" }}
      onSelectContext={(id) =>
        setContext(id === "community" ? "community" : "personal")
      }
      onSelectNavigation={() => {}}
      onCreateCommunity={() => {}}
      onOpenSettings={() => {}}
      onLogout={() => {}}
    >
      <Box h="100%" pt="lg" style={{ minHeight: 0 }}>
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
                  <Button size="xs" leftSection={<IconCloudUpload size={16} />}>
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
                      <Menu.Item leftSection={<IconCloudUpload size={16} />}>
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

      <MediaBrowserGroupModal
        opened={selectionDialog === "group"}
        selected={selected}
        groupActionPending={false}
        groupTargets={groupTargets}
        onTargetsChange={setGroupTargets}
        items={stateItems}
        onClose={() => setSelectionDialog(null)}
        onAddToGroups={async () => { setSelectionDialog(null) }}
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
        onDelete={() => setSelectionDialog(null)}
      />

      <Modal
        opened={detail !== null}
        onClose={closeMediaDetail}
        fullScreen
        padding={0}
        withCloseButton={false}
        styles={{
          content: { background: "transparent" },
          body: { height: "100dvh", padding: 0, background: "transparent" },
        }}
      >
        {detail &&
          (() => {
            const detailIndex = stateItems.findIndex(
              (item) => item.id === detail.id,
            )
            const prev = detailIndex > 0 ? stateItems[detailIndex - 1] : null
            const next =
              detailIndex >= 0 && detailIndex < stateItems.length - 1
                ? stateItems[detailIndex + 1]
                : null
            return (
              <Box
                h="100%"
                style={{
                  display: "grid",
                  gridTemplateColumns: compact
                    ? "minmax(0, 1fr)"
                    : "minmax(0, 1fr) auto",
                  gridTemplateRows:
                    compact && detailInfoOpened
                      ? "minmax(0, 1fr) auto"
                      : "minmax(0, 1fr)",
                  background: "transparent",
                }}
              >
                <Box
                  style={{
                    minWidth: 0,
                    minHeight: 0,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Group
                    h={44}
                    px="xs"
                    justify="flex-end"
                    style={{ flexShrink: 0 }}
                  >
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      aria-label="閉じる"
                      onClick={closeMediaDetail}
                    >
                      <IconX size={18} />
                    </ActionIcon>
                  </Group>
                  <Box
                    style={{
                      flex: 1,
                      minHeight: 0,
                      display: "grid",
                      gridTemplateColumns: "44px minmax(0, 1fr) 44px",
                      alignItems: "center",
                    }}
                  >
                    <Center>
                      {prev && (
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size="lg"
                          aria-label="前のMedia"
                          onClick={() => {
                            setDetailDirection(-1)
                            setDetailZoom(100)
                            setDetailRotateAnimated(false)
                            setDetailRotate(0)
                            setDetail(prev)
                          }}
                        >
                          <IconChevronLeft />
                        </ActionIcon>
                      )}
                    </Center>
                    <Center
                      h="100%"
                      style={{ minWidth: 0, overflow: "hidden" }}
                    >
                      <AnimatePresence
                        mode="wait"
                        initial={false}
                        custom={detailDirection}
                      >
                        <motion.div
                          key={detail.id}
                          custom={detailDirection}
                          initial={{
                            x: detailDirection > 0 ? 32 : -32,
                            opacity: 0,
                          }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{
                            x: detailDirection > 0 ? -32 : 32,
                            opacity: 0,
                          }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {detail.failed ? (
                            <Stack align="center" c="dimmed">
                              <IconPhotoOff size={48} />
                              <Text size="sm">画像を表示できません</Text>
                            </Stack>
                          ) : (
                            <Image
                              src={detail.src}
                              alt={detail.label}
                              w="100%"
                              h="100%"
                              fit="contain"
                              style={{
                                objectFit: "contain",
                                transform: `rotate(${detailRotate}deg) scale(${detailZoom / 100})`,
                                transition: detailRotateAnimated
                                  ? "transform 180ms ease"
                                  : "none",
                              }}
                            />
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </Center>
                    <Center>
                      {next && (
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size="lg"
                          aria-label="次のMedia"
                          onClick={() => {
                            setDetailDirection(1)
                            setDetailZoom(100)
                            setDetailRotateAnimated(false)
                            setDetailRotate(0)
                            setDetail(next)
                          }}
                        >
                          <IconChevronRight />
                        </ActionIcon>
                      )}
                    </Center>
                  </Box>
                  <Box
                    h={48}
                    px="sm"
                    style={{
                      flexShrink: 0,
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
                      alignItems: "center",
                      columnGap: 8,
                    }}
                  >
                    <Group gap={4} wrap="nowrap" justify="flex-start">
                      {!compact && (
                        <>
                          <ActionIcon
                            variant="subtle"
                            aria-label="回転をリセット"
                            onClick={() => {
                              setDetailRotateAnimated(false)
                              setDetailRotate(0)
                            }}
                          >
                            <IconRotate2 size={18} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            aria-label="左へ回転"
                            onClick={() => {
                              setDetailRotateAnimated(true)
                              setDetailRotate((value) => value - 90)
                            }}
                          >
                            <IconRotate size={18} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            aria-label="右へ回転"
                            onClick={() => {
                              setDetailRotateAnimated(true)
                              setDetailRotate((value) => value + 90)
                            }}
                          >
                            <IconRotate
                              size={18}
                              style={{ transform: "scaleX(-1)" }}
                            />
                          </ActionIcon>
                        </>
                      )}
                    </Group>
                    <Text
                      size="xs"
                      c="dimmed"
                      ta="center"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {detailIndex + 1} / {stateItems.length}
                    </Text>
                    <Group
                      gap={4}
                      wrap="nowrap"
                      justify="flex-end"
                      style={{ minWidth: 0 }}
                    >
                      {!compact && (
                        <>
                          <ActionIcon
                            variant="subtle"
                            aria-label="拡大率をリセット"
                            onClick={() => setDetailZoom(100)}
                          >
                            <IconZoomReset size={18} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            aria-label="縮小"
                            disabled={detailZoom <= 50}
                            onClick={() =>
                              setDetailZoom((value) => Math.max(50, value - 10))
                            }
                          >
                            <IconZoomOut size={18} />
                          </ActionIcon>
                          <Slider
                            w={100}
                            size="xs"
                            min={50}
                            max={300}
                            step={10}
                            value={detailZoom}
                            onChange={setDetailZoom}
                            label={null}
                          />
                          <ActionIcon
                            variant="subtle"
                            aria-label="拡大"
                            disabled={detailZoom >= 300}
                            onClick={() =>
                              setDetailZoom((value) =>
                                Math.min(300, value + 10),
                              )
                            }
                          >
                            <IconZoomIn size={18} />
                          </ActionIcon>
                          <ZoomInput
                            value={detailZoom}
                            onChange={setDetailZoom}
                          />
                        </>
                      )}
                      <ActionIcon
                        variant={detailInfoOpened ? "light" : "subtle"}
                        aria-label={
                          detailInfoOpened ? "情報を閉じる" : "情報を開く"
                        }
                        onClick={() => setDetailInfoOpened((value) => !value)}
                      >
                        <IconInfoCircle size={18} />
                      </ActionIcon>
                    </Group>
                  </Box>
                </Box>

                <AnimatePresence initial={false}>
                  {detailInfoOpened && (
                    <motion.div
                      initial={
                        compact
                          ? { height: 0, opacity: 0 }
                          : { width: 0, opacity: 0 }
                      }
                      animate={
                        compact
                          ? { height: "auto", opacity: 1 }
                          : { width: 340, opacity: 1 }
                      }
                      exit={
                        compact
                          ? { height: 0, opacity: 0 }
                          : { width: 0, opacity: 0 }
                      }
                      transition={{ duration: 0.3 }}
                      style={{
                        overflow: "hidden",
                        minWidth: 0,
                        gridColumn: compact ? "1" : "2",
                        gridRow: compact ? "2" : "1",
                      }}
                    >
                      <Box
                        h="100%"
                        bg="var(--mantine-color-body)"
                        style={{
                          borderLeft: compact
                            ? undefined
                            : "1px solid var(--mantine-color-default-border)",
                          borderTop: compact
                            ? "1px solid var(--mantine-color-default-border)"
                            : undefined,
                          display: "flex",
                          flexDirection: "column",
                          overflow: "hidden",
                        }}
                      >
                        <Stack
                          gap="md"
                          p="md"
                          style={{ flex: 1, overflowY: "auto" }}
                        >
                          <Stack gap="xs">
                            <Group justify="space-between">
                              <Text size="xs" c="dimmed">
                                ファイルサイズ
                              </Text>
                              <Text size="xs">8.4 MB</Text>
                            </Group>
                            <Group justify="space-between">
                              <Text size="xs" c="dimmed">
                                サイズ
                              </Text>
                              <Text size="xs">4032 × 3024</Text>
                            </Group>
                            <Group justify="space-between">
                              <Text size="xs" c="dimmed">
                                アップロード
                              </Text>
                              <Text size="xs">2026/10/03 08:42</Text>
                            </Group>
                            <Group justify="space-between">
                              <Text size="xs" c="dimmed">
                                Uploader
                              </Text>
                              <Text size="xs">Hazuki</Text>
                            </Group>
                          </Stack>
                          <Stack gap={4}>
                            <Button
                              size="xs"
                              variant="default"
                              fullWidth
                              disabled={downloadMock !== "available"}
                              leftSection={<IconDownload size={15} />}
                              aria-describedby={
                                downloadMock === "available"
                                  ? undefined
                                  : "original-download-unavailable"
                              }
                            >
                              Originalをダウンロード
                            </Button>
                            {downloadMock !== "available" && (
                              <Group
                                gap={5}
                                align="flex-start"
                                wrap="nowrap"
                                id="original-download-unavailable"
                              >
                                <IconInfoCircle
                                  size={14}
                                  style={{ flexShrink: 0, marginTop: 2 }}
                                />
                                <Text size="xs" c="dimmed">
                                  {downloadMock === "forbidden"
                                    ? "このMediaのOriginalをダウンロードする権限がありません。"
                                    : "Originalを準備中です。処理完了後にダウンロードできます。"}
                                </Text>
                              </Group>
                            )}
                          </Stack>
                          <Divider
                            style={{
                              marginInline:
                                "calc(-1 * var(--mantine-spacing-md))",
                            }}
                          />
                          {(["groups", "tags"] as const).map((kind) => {
                            const values = detailValues[kind]
                            const visible = values.slice(0, 6)
                            return (
                              <Box key={kind}>
                                <Group
                                  justify="space-between"
                                  mb="sm"
                                  wrap="nowrap"
                                >
                                  <Group gap={6}>
                                    <Text size="xs" c="dimmed">
                                      {kind === "groups" ? "Groups" : "Tags"}
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                      ({values.length})
                                    </Text>
                                  </Group>
                                  <Button
                                    size="compact-xs"
                                    variant="subtle"
                                    onClick={() => openDetailEditor(kind)}
                                  >
                                    編集
                                  </Button>
                                </Group>
                                <Group gap={6}>
                                  {values.length === 0 ? (
                                    <Text size="xs" c="dimmed">
                                      未設定
                                    </Text>
                                  ) : (
                                    visible.map((value) => (
                                      <Badge
                                        key={value}
                                        variant={
                                          kind === "tags" ? "light" : "outline"
                                        }
                                        style={{
                                          maxWidth: "100%",
                                          overflowWrap: "anywhere",
                                          height: "auto",
                                          whiteSpace: "normal",
                                        }}
                                      >
                                        {value}
                                      </Badge>
                                    ))
                                  )}
                                </Group>
                                {values.length > 6 && (
                                  <>
                                    <Collapse
                                      in={detailSectionsExpanded[kind]}
                                      transitionDuration={200}
                                    >
                                      <Group gap={6} mt="xs">
                                        {values.slice(6).map((value) => (
                                          <Badge
                                            key={value}
                                            variant={
                                              kind === "tags"
                                                ? "light"
                                                : "outline"
                                            }
                                            style={{
                                              maxWidth: "100%",
                                              overflowWrap: "anywhere",
                                              height: "auto",
                                              whiteSpace: "normal",
                                            }}
                                          >
                                            {value}
                                          </Badge>
                                        ))}
                                      </Group>
                                    </Collapse>
                                    <Group justify="center" mt="xs">
                                      <Button
                                        size="compact-xs"
                                        variant="subtle"
                                        color="gray"
                                        fw={400}
                                        onClick={() =>
                                          toggleDetailSection(kind)
                                        }
                                        aria-expanded={
                                          detailSectionsExpanded[kind]
                                        }
                                        rightSection={
                                          <IconChevronDown
                                            size={14}
                                            style={{
                                              transform: detailSectionsExpanded[
                                                kind
                                              ]
                                                ? "rotate(180deg)"
                                                : "rotate(0deg)",
                                              transition:
                                                "transform 200ms ease",
                                            }}
                                          />
                                        }
                                      >
                                        {detailSectionsExpanded[kind]
                                          ? "折りたたむ"
                                          : `ほか${values.length - 6}件を表示`}
                                      </Button>
                                    </Group>
                                  </>
                                )}
                                {kind === "groups" && (
                                  <Divider
                                    mt="md"
                                    style={{
                                      marginInline:
                                        "calc(-1 * var(--mantine-spacing-md))",
                                    }}
                                  />
                                )}
                              </Box>
                            )
                          })}
                          <Divider
                            style={{
                              marginInline:
                                "calc(-1 * var(--mantine-spacing-md))",
                            }}
                          />
                          {context === "personal" ? (
                            <Box>
                              <Group
                                justify="space-between"
                                mb="sm"
                                wrap="nowrap"
                              >
                                <Group gap={6}>
                                  <Text size="xs" c="dimmed">
                                    共有先Community
                                  </Text>
                                  <Text size="xs" c="dimmed">
                                    ({detailValues.communities.length})
                                  </Text>
                                </Group>
                                <Button
                                  size="compact-xs"
                                  variant="subtle"
                                  leftSection={<IconPlus size={13} />}
                                  onClick={() => {
                                    setShareTarget(null)
                                    setDetailEditor("communities")
                                  }}
                                >
                                  共有
                                </Button>
                              </Group>
                              <Stack gap="xs">
                                {detailValues.communities.length === 0 ? (
                                  <Text size="xs" c="dimmed">
                                    未共有
                                  </Text>
                                ) : (
                                  detailValues.communities
                                    .slice(0, 3)
                                    .map((value) => (
                                      <Group
                                        key={value}
                                        justify="space-between"
                                        wrap="nowrap"
                                        mih={32}
                                        gap="xs"
                                      >
                                        <Box
                                          style={{
                                            minWidth: 0,
                                            flex: 1,
                                            overflowWrap: "anywhere",
                                          }}
                                        >
                                          <Text size="xs">{value}</Text>
                                        </Box>
                                        <Button
                                          size="compact-xs"
                                          variant="subtle"
                                          color="red"
                                          style={{ flexShrink: 0 }}
                                          onClick={() =>
                                            setUnshareTarget(value)
                                          }
                                        >
                                          共有解除
                                        </Button>
                                      </Group>
                                    ))
                                )}
                                {detailValues.communities.length > 3 && (
                                  <>
                                    <Collapse
                                      in={detailSectionsExpanded.communities}
                                      transitionDuration={200}
                                    >
                                      <Stack gap="xs">
                                        {detailValues.communities
                                          .slice(3)
                                          .map((value) => (
                                            <Group
                                              key={value}
                                              justify="space-between"
                                              wrap="nowrap"
                                              mih={32}
                                              gap="xs"
                                            >
                                              <Box
                                                style={{
                                                  minWidth: 0,
                                                  flex: 1,
                                                  overflowWrap: "anywhere",
                                                }}
                                              >
                                                <Text size="xs">{value}</Text>
                                              </Box>
                                              <Button
                                                size="compact-xs"
                                                variant="subtle"
                                                color="red"
                                                style={{ flexShrink: 0 }}
                                                onClick={() =>
                                                  setUnshareTarget(value)
                                                }
                                              >
                                                共有解除
                                              </Button>
                                            </Group>
                                          ))}
                                      </Stack>
                                    </Collapse>
                                    <Group justify="center">
                                      <Button
                                        size="compact-xs"
                                        variant="subtle"
                                        color="gray"
                                        fw={400}
                                        onClick={() =>
                                          toggleDetailSection("communities")
                                        }
                                        aria-expanded={
                                          detailSectionsExpanded.communities
                                        }
                                        rightSection={
                                          <IconChevronDown
                                            size={14}
                                            style={{
                                              transform:
                                                detailSectionsExpanded.communities
                                                  ? "rotate(180deg)"
                                                  : "rotate(0deg)",
                                              transition:
                                                "transform 200ms ease",
                                            }}
                                          />
                                        }
                                      >
                                        {detailSectionsExpanded.communities
                                          ? "折りたたむ"
                                          : `ほか${detailValues.communities.length - 3}件を表示`}
                                      </Button>
                                    </Group>
                                  </>
                                )}
                              </Stack>
                            </Box>
                          ) : (
                            <Group justify="space-between">
                              <Text size="xs" c="dimmed">
                                管理
                              </Text>
                              <Text size="xs">Community管理</Text>
                            </Group>
                          )}
                        </Stack>
                        <Box
                          p="md"
                          style={{
                            borderTop:
                              "1px solid var(--mantine-color-default-border)",
                            flexShrink: 0,
                          }}
                        >
                          <Group justify="flex-end">
                            <Button
                              size="xs"
                              variant="subtle"
                              color="red"
                              leftSection={<IconTrash size={15} />}
                            >
                              削除
                            </Button>
                          </Group>
                        </Box>
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>
            )
          })()}
      </Modal>
      <Notifications position="top-right" />
      <CommunityUnshareModal
        unshareTarget={unshareTarget}
        setUnshareTarget={setUnshareTarget}
        removeCommunityShare={removeCommunityShare}
      />
      <CommunityShareModal
        detailEditor={detailEditor}
        setDetailEditor={setDetailEditor}
        detailValues={detailValues}
        shareTarget={shareTarget}
        setShareTarget={setShareTarget}
        addCommunityShare={addCommunityShare}
      />
      <TagsEditModal
        detailEditor={detailEditor}
        setDetailEditor={setDetailEditor}
        detailDraft={detailDraft}
        setDetailDraft={setDetailDraft}
        saveDetailDraft={async () => { saveDetailDraft() }}
      />
      <GroupsEditModal
        detailEditor={detailEditor}
        setDetailEditor={setDetailEditor}
        detailDraft={detailDraft}
        setDetailDraft={setDetailDraft}
        saveDetailDraft={async () => { saveDetailDraft() }}
      />
          </Box>
</PrototypeApplicationShell>
  )
}
