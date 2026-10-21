"use client"

import {
  Badge,
  Alert,
  Box,
  Button,
  Collapse,
  Divider,
  Group,
  Modal,
  MultiSelect,
  Center,
  Loader,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core"
import { useDisclosure, useMediaQuery } from "@mantine/hooks"
import {
  IconChevronRight,
  IconEdit,
  IconFolderPlus,
  IconSearch,
  IconX,
} from "@tabler/icons-react"
import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useMemo, useRef, useState } from "react"
import type { Layout, LayoutChangedMeta } from "react-resizable-panels"
import { useGroupRef } from "react-resizable-panels"
import { showNotification } from "@/components/Feedback"
import { SplitView } from "@/components/SplitView"
import { MediaDetailDialog } from "@/features/media-detail"
import { canEnterGroupName, countGroupNameGraphemes, validGroupName } from "./groupName"
import {
  groupRelationOptionReason,
  groupRelationOptions,
  sortGroupRelationNames,
} from "./groupRelationOptions"

export type GroupBrowserGroup = {
  id: string
  name: string
  mediaCount: number
  previewCount: number
  parentNames: string[]
  childNames: string[]
}

export type GroupRelationAvailability = Record<
  string,
  {
    parent: { canAdd: boolean; reason?: string }
    child: { canAdd: boolean; reason?: string }
  }
>

export type GroupBrowserProps = {
  contextKind?: "personal" | "community"
  communityId?: string
  groupsData?: GroupBrowserGroup[]
  mediaItemsData?: Array<{ id: string; label: string; src: string | null }>
  groupMemberships?: Record<string, string[]>
  onSaveMediaGroups?: (mediaId: string, groupNames: string[]) => Promise<void>
  relationCandidates?: string[]
  relationAvailability?: GroupRelationAvailability
  onCreateGroup?: (
    name: string,
    parents: string[],
    children: string[],
  ) => Promise<void>
  onUpdateGroup?: (
    id: string,
    name: string,
    parents: string[],
    children: string[],
  ) => Promise<"conflict" | void>
  onDeleteGroup?: (id: string) => Promise<void>
  onSelectGroup?: (id: string | null) => void
  detailsReady?: boolean
  mediaDetailState?: "ready" | "loading" | "error"
  mediaPageState?: "idle" | "loading" | "error"
  onRetryMediaPage?: () => void
  onRetryGroupMedia?: () => Promise<void>
  relationCandidateState?: "ready" | "loading" | "error"
  onRetryRelationCandidates?: () => Promise<void>
  canManage?: boolean
  hideManagementActions?: boolean
}

type GroupFixture = {
  id: string
  name: string
  mediaCount: number
  previewCount: number
  parentNames: string[]
  childNames: string[]
}

const groups: GroupFixture[] = [
  {
    id: "travel",
    name: "旅行",
    mediaCount: 128,
    previewCount: 7,
    parentNames: ["2026"],
    childNames: ["北海道", "東北", "関東"],
  },
  {
    id: "family",
    name: "家族",
    mediaCount: 84,
    previewCount: 4,
    parentNames: [],
    childNames: ["イベント"],
  },
  {
    id: "food",
    name: "料理",
    mediaCount: 42,
    previewCount: 3,
    parentNames: ["日常"],
    childNames: [],
  },
  {
    id: "landscape",
    name: "風景写真",
    mediaCount: 31,
    previewCount: 1,
    parentNames: ["旅行", "お気に入り"],
    childNames: ["山", "海", "夕景"],
  },
  {
    id: "archive",
    name: "あとで整理する写真と動画をまとめた非常に長い名前のGroup",
    mediaCount: 18,
    previewCount: 2,
    parentNames: ["アーカイブ"],
    childNames: ["未整理"],
  },
  {
    id: "empty",
    name: "新しいGroup",
    mediaCount: 3,
    previewCount: 0,
    parentNames: [],
    childNames: [],
  },
]

const relationCandidateNames = [
  ...groups.map((group) => group.name),
  "北海道",
  "東北",
  "関東",
  "関西",
  "九州",
  "イベント",
  "日常",
  "お気に入り",
  "山",
  "海",
  "夕景",
  "夜景",
  "ポートレート",
  "アーカイブ",
  "未整理",
]

const previewImages = Array.from(
  { length: 9 },
  (_, index) =>
    `/__dev-assets/group-browser/group-media-${String(index + 1).padStart(2, "0")}.jpg`,
)

function GroupVisual({ startIndex }: { startIndex: number }) {
  const mediaIndexes = Array.from(
    { length: 3 },
    (_, index) => startIndex + index,
  )

  return (
    <Box
      w="100%"
      h="100%"
      bg="var(--mantine-color-default-hover)"
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap: 2,
        overflow: "hidden",
      }}
    >
      {mediaIndexes.map((mediaIndex, index) => (
        <Box
          key={mediaIndex}
          style={{
            gridRow: index === 0 ? "1 / 3" : undefined,
            backgroundImage: `url("${previewImages[mediaIndex % previewImages.length]}")`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
      ))}
    </Box>
  )
}

function PreviewGrid({
  count,
  remote = false,
  sources = [],
}: {
  count: number
  remote?: boolean
  sources?: string[]
}) {
  const previewCellIds = ["preview-1", "preview-2", "preview-3", "preview-4"]
  let groupVisualIndex = 0
  return (
    <SimpleGrid cols={2} spacing={4}>
      {previewCellIds.map((cellId, index) => {
        const media = index < Math.min(count, 4)
        const continuation = count > 4 && index === 3
        const groupVisualStart = groupVisualIndex * 3
        if (!media) groupVisualIndex += 1
        return (
          <Box
            key={cellId}
            bdrs="sm"
            style={{
              position: "relative",
              aspectRatio: "1 / 1",
              border: media
                ? "1px solid var(--mantine-color-default-border)"
                : undefined,
              overflow: "hidden",
              ...(media
                ? {
                    backgroundImage: remote
                      ? sources[index]
                        ? `url("${sources[index]}")`
                        : undefined
                      : `url("${previewImages[index % previewImages.length]}")`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                  }
                : {}),
            }}
          >
            {media && remote && !sources[index] && (
              <Box
                w="100%"
                h="100%"
                bg="var(--mantine-color-default-hover)"
                style={{ position: "absolute", inset: 0 }}
              />
            )}
            {!media &&
              (remote ? (
                <Box
                  w="100%"
                  h="100%"
                  bg="var(--mantine-color-default-hover)"
                />
              ) : (
                <GroupVisual startIndex={groupVisualStart} />
              ))}
            {continuation && (
              <Box
                pos="absolute"
                inset={0}
                bg="rgba(0, 0, 0, 0.32)"
                style={{ display: "grid", placeItems: "center" }}
              >
                <Text c="white" fw={700} size="lg">
                  …
                </Text>
              </Box>
            )}
          </Box>
        )
      })}
    </SimpleGrid>
  )
}

function RelationItems({ names }: { names: string[] }) {
  if (names.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        なし
      </Text>
    )
  }
  return (
    <Group gap={6}>
      {[...names].sort().map((name) => (
        <Badge key={name} variant="light">
          {name}
        </Badge>
      ))}
    </Group>
  )
}

function RelationEditor({
  label,
  names,
  oppositeNames,
  onChange,
  currentGroupName,
  candidates = relationCandidateNames,
  availability,
}: {
  label: string
  names: string[]
  oppositeNames: string[]
  onChange: (names: string[]) => void
  currentGroupName: string
  candidates?: string[]
  availability?: GroupRelationAvailability
}) {
  const direction = label === "Parents" ? "parent" : "child"
  const data = groupRelationOptions({
    candidates,
    names,
    oppositeNames,
    currentGroupName,
    direction,
    availability,
  })

  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <Text fw={600} size="sm">
          {label}
        </Text>
        <Text size="xs" c="dimmed">
          {names.length} / 10
        </Text>
      </Group>
      <MultiSelect
        data={data}
        value={names}
        onChange={(values) => onChange(sortGroupRelationNames(values))}
        searchable
        placeholder="Groupを検索"
        rightSection={null}
        maxValues={10}
        hidePickedOptions={false}
        nothingFoundMessage="候補がありません"
        styles={{
          input: {
            height: 120,
            overflow: "hidden",
            alignItems: "flex-start",
          },
          pillsList: {
            height: "100%",
            overflowY: "auto",
            alignContent: "flex-start",
          },
        }}
        renderOption={({ option, checked }) => {
          const reason = groupRelationOptionReason({
            name: option.value,
            checked,
            oppositeNames,
            currentGroupName,
            direction,
            availability,
          })
          return (
            <Group justify="space-between" wrap="nowrap" w="100%">
              <Text size="sm">{option.label}</Text>
              <Text size="xs" c="dimmed">
                {reason}
              </Text>
            </Group>
          )
        }}
      />
      {names.length >= 10 && (
        <Text size="xs" c="dimmed">
          追加できるGroupは10件までです
        </Text>
      )}
    </Stack>
  )
}
function MediaGrid({
  onOpen,
  items,
}: {
  onOpen: (index: number) => void
  items?: Array<{ id: string; label: string; src: string | null }>
}) {
  // Local dummy thumbnails; actual Group media will be supplied by the Connection.
  const mediaItems =
    items ??
    Array.from({ length: 24 }, (_, index) => ({
      id: `media-${index + 1}`,
      label: `Media ${index + 1}`,
      src: previewImages[index % previewImages.length],
    }))
  return (
    <SimpleGrid cols={{ base: 2, sm: 3, lg: 4, xl: 5 }} spacing="sm">
      {mediaItems.map(({ id, label, src }, index) => (
        <UnstyledButton
          key={id}
          aria-label={
            src
              ? `${label}の詳細を開く`
              : `${label}の詳細を開く（画像プレビューなし）`
          }
          onClick={() => onOpen(index)}
          bdrs="sm"
          style={{
            display: "block",
            aspectRatio: "1 / 1",
            border: "1px solid var(--mantine-color-default-border)",
            backgroundImage: src ? `url("${src}")` : undefined,
            backgroundColor: "var(--mantine-color-default-hover)",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          {!src && (
            <Text size="xs" c="dimmed" ta="center">
              {label}
            </Text>
          )}
        </UnstyledButton>
      ))}
    </SimpleGrid>
  )
}

export function GroupBrowser({
  contextKind = "personal",
  groupsData,
  mediaItemsData,
  groupMemberships,
  onSaveMediaGroups,
  relationCandidates: candidates,
  relationAvailability,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onSelectGroup,
  detailsReady = true,
  mediaDetailState = "ready",
  mediaPageState = "idle",
  onRetryMediaPage,
  onRetryGroupMedia,
  relationCandidateState = "ready",
  onRetryRelationCandidates,
  canManage = true,
  hideManagementActions = false,
}: GroupBrowserProps) {
  const busyRef = useRef(false)
  const [saving, setSaving] = useState(false)
  const runAction = async (
    action: () => Promise<void>,
  ): Promise<"ok" | "busy" | "error"> => {
    if (busyRef.current) return "busy"
    busyRef.current = true
    setSaving(true)
    try {
      await action()
      return "ok"
    } catch {
      return "error"
    } finally {
      busyRef.current = false
      setSaving(false)
    }
  }
  const [createdGroups, setCreatedGroups] = useState<typeof groups>([])
  const [createOpened, create] = useDisclosure(false)
  const [createName, setCreateName] = useState("")
  const [createParents, setCreateParents] = useState<string[]>([])
  const [createChildren, setCreateChildren] = useState<string[]>([])
  const allGroups = useMemo(
    () => [...(groupsData ?? groups), ...createdGroups],
    [groupsData, createdGroups],
  )
  const openCreate = () => {
    setCreateName("")
    setCreateParents([])
    setCreateChildren([])
    create.open()
  }
  const submitCreate = async () => {
    const name = createName.trim()
    if (!validGroupName(createName)) return
    const result = await runAction(async () => {
      if (onCreateGroup) {
        await onCreateGroup(name, createParents, createChildren)
      } else {
        setCreatedGroups((current) => [
          ...current,
          {
            id: `created-${Date.now()}-${current.length}`,
            name,
            mediaCount: 0,
            previewCount: 0,
            parentNames: createParents,
            childNames: createChildren,
          },
        ])
      }
    })
    if (result === "error") {
      showNotification({
        kind: "error",
        title: "Groupを作成できませんでした",
        description: "入力内容と通信状態を確認して、もう一度お試しください。",
      })
      return
    }
    if (result !== "ok") return
    create.close()
    showNotification({
      kind: "success",
      title: "Groupを作成",
      description: `「${name}」を作成しました。`,
    })
  }

  const [query, setQuery] = useState("")
  const [appliedQuery, setAppliedQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [imageDetailIndex, setMediaDetailIndex] = useState<number | null>(null)
  const groupMediaItems = useMemo(
    () =>
      mediaItemsData
        ? mediaItemsData.map((item) => ({
            ...item,
            src: item.src ?? "",
            failed: !item.src,
          }))
        : Array.from({ length: 24 }, (_, index) => ({
            id: `group-media-${index + 1}`,
            label: `Media ${index + 1}`,
            src: previewImages[index % previewImages.length],
          })),
    [mediaItemsData],
  )

  const openMediaAt = (index: number) => {
    if (!mediaItemsData) {
      setMediaDetailIndex(index)
      return
    }
    const id = mediaItemsData[index]?.id
    const availableIndex = groupMediaItems.findIndex((item) => item.id === id)
    if (availableIndex >= 0) setMediaDetailIndex(availableIndex)
  }

  const splitViewRef = useGroupRef()
  const [savedLayout, setSavedLayout] = useState({ groups: 40, detail: 60 })
  const [relationsOpened, relations] = useDisclosure(false)
  const compact = useMediaQuery("(max-width: 47.99em)")
  const [compactView, setCompactView] = useState<"groups" | "detail">("groups")
  const compactDetailHeadingRef = useRef<HTMLParagraphElement>(null)
  const compactSearchRef = useRef<HTMLInputElement>(null)
  const compactGroupItemRefs = useRef(new Map<string, HTMLButtonElement>())
  const compactReturnGroupIdRef = useRef<string | null>(null)
  const compactFocusIntentRef = useRef<"detail" | "groups" | null>(null)
  const [editOpened, edit] = useDisclosure(false)
  const [deleteOpened, deletion] = useDisclosure(false)
  const [draftName, setDraftName] = useState("")
  const [draftParents, setDraftParents] = useState<string[]>([])
  const [draftChildren, setDraftChildren] = useState<string[]>([])
  const [conflictNeedsReview, setConflictNeedsReview] = useState(false)

  const visibleGroups = useMemo(() => {
    const normalized = appliedQuery.trim()
    if (!normalized) return allGroups
    return allGroups.filter((group) =>
      groupsData !== undefined
        ? group.name.includes(normalized)
        : group.name
            .toLocaleLowerCase()
            .includes(normalized.toLocaleLowerCase()),
    )
  }, [appliedQuery, allGroups, groupsData])

  const selected = allGroups.find((group) => group.id === selectedId) ?? null

  const openEdit = () => {
    if (!selected || !detailsReady || !canManage) return
    setConflictNeedsReview(false)
    setDraftName(selected.name)
    setDraftParents(selected.parentNames)
    setDraftChildren(selected.childNames)
    edit.open()
  }

  useEffect(() => {
    const stored = window.localStorage.getItem("memoria-group-browser-layout")
    if (!stored) return
    try {
      const layout = JSON.parse(stored) as { groups?: number; detail?: number }
      if (
        typeof layout.groups === "number" &&
        typeof layout.detail === "number"
      ) {
        setSavedLayout({ groups: layout.groups, detail: layout.detail })
      }
    } catch {
      window.localStorage.removeItem("memoria-group-browser-layout")
    }
  }, [])

  // Explicit Compact navigation must not leave focus on an unmounted element.
  useEffect(() => {
    if (!compact || compactFocusIntentRef.current !== compactView) return
    compactFocusIntentRef.current = null
    if (compactView === "detail") {
      compactDetailHeadingRef.current?.focus()
    } else {
      const origin = compactReturnGroupIdRef.current
      const item = origin ? compactGroupItemRefs.current.get(origin) : null
      ;(item ?? compactSearchRef.current)?.focus()
    }
  }, [compact, compactView])

  const openDetail = (id: string) => {
    setSelectedId(id)
    onSelectGroup?.(id)
    if (compact) {
      compactReturnGroupIdRef.current = id
      compactFocusIntentRef.current = "detail"
      setCompactView("detail")
      return
    }
    const layout = splitViewRef.current?.getLayout()
    if (layout?.detail === 0) {
      splitViewRef.current?.setLayout(savedLayout)
    }
  }

  const closeDetail = () => {
    setSelectedId(null)
    onSelectGroup?.(null)
    if (compact) {
      compactFocusIntentRef.current = "groups"
      setCompactView("groups")
    }
  }

  const handleDetailExitComplete = () => {
    if (compact || selectedId) return
    splitViewRef.current?.setLayout({ groups: 100, detail: 0 })
  }

  const handleLayoutChanged = (layout: Layout, _meta: LayoutChangedMeta) => {
    if (!selectedId || layout.detail === 0) return
    const next = { groups: layout.groups, detail: layout.detail }
    setSavedLayout(next)
    window.localStorage.setItem(
      "memoria-group-browser-layout",
      JSON.stringify(next),
    )
  }

  const relationCandidateFeedback =
    canManage && selected && relationCandidateState !== "ready" ? (
      <Box px="sm" py="xs">
        {relationCandidateState === "error" ? (
          <Alert color="red" title="Groupの関係候補を取得できませんでした">
            <Stack gap="xs">
              <Text size="sm">
                関係の編集に必要な候補を取得できませんでした。GroupとMediaの閲覧は継続できます。
              </Text>
              <Group justify="flex-start">
                <Button size="xs" variant="light" onClick={() => void onRetryRelationCandidates?.()}>
                  再試行
                </Button>
              </Group>
            </Stack>
          </Alert>
        ) : (
          <Text size="xs" c="dimmed" role="status">
            関係の編集候補を取得しています
          </Text>
        )}
      </Box>
    ) : null

  const relationDetailSection = (
    <>
      <UnstyledButton
        onClick={relations.toggle}
        px="sm"
        py={6}
        aria-expanded={relationsOpened}
        aria-label="このGroupとの関係を開閉"
      >
        <Group gap="xs" wrap="nowrap">
          <IconChevronRight
            size={16}
            style={{
              transform: relationsOpened
                ? "rotate(90deg)"
                : "rotate(0deg)",
              transition: "transform 200ms ease",
            }}
          />
          <Text size="xs" c="dimmed">
            このGroupとの関係
          </Text>
        </Group>
      </UnstyledButton>
      <Collapse in={relationsOpened} transitionDuration={200}>
        <Box px="lg" pb="sm">
          <SimpleGrid cols={2} spacing="lg">
            <Stack gap={4}>
              <Text size="xs" c="dimmed">
                Parents
              </Text>
              <RelationItems
                names={selected?.parentNames ?? []}
              />
            </Stack>
            <Stack gap={4}>
              <Text size="xs" c="dimmed">
                Children
              </Text>
              <RelationItems names={selected?.childNames ?? []} />
            </Stack>
          </SimpleGrid>
        </Box>
      </Collapse>
    </>
  )

  const mediaPageFeedback = mediaPageState === "error" ? (
    <Alert color="red" title="追加のMediaを取得できませんでした" mt="sm">
      <Stack gap="xs" align="flex-start">
        <Text size="sm">取得済みのMediaは引き続き閲覧できます。</Text>
        <Button size="xs" variant="light" onClick={onRetryMediaPage}>
          再試行
        </Button>
      </Stack>
    </Alert>
  ) : mediaPageState === "loading" ? (
    <Text size="xs" c="dimmed" mt="sm" role="status">
      追加のMediaを取得しています
    </Text>
  ) : null

  const createDialog = (
    <Modal
      opened={createOpened}
      onClose={create.close}
      title="Groupを作成"
      size="lg"
      centered
      withCloseButton={false}
    >
      <Stack gap="lg">
        {conflictNeedsReview && (
          <Alert color="yellow" title="Groupの最新状態を確認してください">
            他の操作によってGroupが変更されました。入力内容は保持しています。
            最新のGroup名とParent・Childの関係を確認し、変更を適用する場合は
            「確認して再保存」を選択してください。
            <Button mt="sm" variant="light" onClick={() => setConflictNeedsReview(false)}
              disabled={!detailsReady || saving}>
              確認して再保存
            </Button>
          </Alert>
        )}
        <TextInput
          label={
            <Group justify="space-between" wrap="nowrap">
              <Text component="span" size="sm" fw={500}>
                名前
              </Text>
              <Text component="span" size="xs" c="dimmed">
                {countGroupNameGraphemes(createName)} / 100
              </Text>
            </Group>
          }
          value={createName}
          onChange={(event) => {
            const value = event.currentTarget.value
            if (canEnterGroupName(value)) setCreateName(value)
          }}
          placeholder="Group名"
          styles={{ label: { display: "block", width: "100%" } }}
          required
        />
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          <RelationEditor
            label="Parents"
            names={createParents}
            oppositeNames={createChildren}
            onChange={setCreateParents}
            currentGroupName={createName.trim()}
            candidates={candidates}
            availability={relationAvailability}
          />
          <RelationEditor
            label="Children"
            names={createChildren}
            oppositeNames={createParents}
            onChange={setCreateChildren}
            currentGroupName={createName.trim()}
            candidates={candidates}
            availability={relationAvailability}
          />
        </SimpleGrid>
        <Group justify="flex-end">
          <Button variant="default" onClick={create.close}>
            キャンセル
          </Button>
          <Button
            onClick={submitCreate}
            disabled={!canManage || !validGroupName(createName) || saving}
          >
            作成
          </Button>
        </Group>
      </Stack>
    </Modal>
  )

  const editDialog = (
    <Modal
      opened={editOpened}
      onClose={edit.close}
      title="Groupを編集"
      size="lg"
      centered
      withCloseButton={false}
    >
      <Stack gap="lg">
        <TextInput
          label={
            <Group justify="space-between" wrap="nowrap">
              <Text component="span" size="sm" fw={500}>
                名前
              </Text>
              <Text component="span" size="xs" c="dimmed">
                {countGroupNameGraphemes(draftName)} / 100
              </Text>
            </Group>
          }
          value={draftName}
          onChange={(event) => {
            const value = event.currentTarget.value
            if (canEnterGroupName(value)) setDraftName(value)
          }}
          placeholder="Group名"
          styles={{ label: { display: "block", width: "100%" } }}
        />
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          <RelationEditor
            label="Parents"
            names={draftParents}
            oppositeNames={draftChildren}
            onChange={setDraftParents}
            currentGroupName={selected?.name ?? ""}
            candidates={candidates}
            availability={relationAvailability}
          />
          <RelationEditor
            label="Children"
            names={draftChildren}
            oppositeNames={draftParents}
            onChange={setDraftChildren}
            currentGroupName={selected?.name ?? ""}
            candidates={candidates}
            availability={relationAvailability}
          />
        </SimpleGrid>
        <Divider />
        <Box pos="relative">
          <Button variant="subtle" color="red" onClick={deletion.open}>
            削除
          </Button>
          <Button
            variant="default"
            onClick={edit.close}
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            キャンセル
          </Button>
          <Button
            onClick={async () => {
              if (!selected || !validGroupName(draftName)) return
              if (conflictNeedsReview || !detailsReady) return
              let conflict = false
              const result = await runAction(async () => {
                const outcome = await onUpdateGroup?.(
                  selected.id,
                  draftName.trim(),
                  draftParents,
                  draftChildren,
                )
                if (outcome === "conflict") conflict = true
              })
              if (conflict) {
                setConflictNeedsReview(true)
                return
              }
              if (result === "error") {
                showNotification({
                  kind: "error",
                  title: "Groupを更新できませんでした",
                  description:
                    "最新のGroup情報を確認してから、再度お試しください。",
                })
                return
              }
              if (result === "ok") edit.close()
            }}
            disabled={!canManage || !detailsReady || conflictNeedsReview || !validGroupName(draftName) || saving}
            style={{ position: "absolute", right: 0 }}
          >
            保存
          </Button>
        </Box>
      </Stack>
    </Modal>
  )

  const deleteDialog = (
    <Modal
      opened={deleteOpened}
      onClose={() => {
        if (!saving) deletion.close()
      }}
      closeOnEscape={!saving}
      closeOnClickOutside={!saving}
      title="Groupを削除"
      centered
      withCloseButton={false}
    >
      <Stack>
        <Text size="sm">
          「{selected?.name ?? ""}
          」を削除します。このGroupによるMedia分類とGroup間の関係は削除されますが、Media本体と他のGroupは削除されません。
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={deletion.close} disabled={saving}>
            キャンセル
          </Button>
          <Button
            color="red"
            disabled={!canManage || saving}
            onClick={async () => {
              if (!selected) return
              const result = await runAction(async () => {
                await onDeleteGroup?.(selected.id)
              })
              if (result === "error") {
                showNotification({
                  kind: "error",
                  title: "Groupの削除結果を確認できませんでした",
                  description:
                    "最新のGroup状態を確認してから、再実行を判断してください。",
                })
                return
              }
              if (result !== "ok") return
              deletion.close()
              edit.close()
              compactReturnGroupIdRef.current = null
              closeDetail()
              showNotification({
                kind: "success",
                title: "Groupを削除",
                description: "Groupを削除しました。",
              })
            }}
          >
            削除
          </Button>
        </Group>
      </Stack>
    </Modal>
  )

  return (
    <>
      {createDialog}
      {editDialog}
      {deleteDialog}
      {compact ? (
        <Box h="calc(100vh - 88px)" style={{ overflow: "hidden" }}>
          {compactView === "groups" ? (
            <Box
              h="100%"
              style={{ display: "flex", flexDirection: "column", minHeight: 0 }}
            >
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
                  <Group
                    component="form"
                    onSubmit={(event) => {
                      event.preventDefault()
                      setAppliedQuery(query)
                    }}
                    gap="xs"
                    wrap="nowrap"
                    style={{ minWidth: 0 }}
                  >
                    <TextInput
                      w={compact ? "100%" : 280}
                      maw="100%"
                      size="xs"
                      ref={compactSearchRef}
                      value={query}
                      onChange={(event) => setQuery(event.currentTarget.value)}
                      placeholder="Groupを検索"
                      leftSection={<IconSearch size={16} />}
                      style={{ flex: compact ? "1 1 auto" : undefined }}
                    />
                    <Button size="xs" type="submit">
                      検索
                    </Button>
                  </Group>
                </Box>
                <Group
                  gap="xs"
                  wrap="nowrap"
                  justify="flex-end"
                  style={{ gridColumn: compact ? "1" : undefined }}
                >
                  {!hideManagementActions && (
                  <Button
                    size="xs"
                    leftSection={<IconFolderPlus size={16} />}
                    onClick={openCreate}
                    disabled={!canManage}
                  >
                    Groupを作成
                  </Button>
                  )}
                </Group>
              </Box>
              <Divider />
              <ScrollArea flex={1}>
                <Box
                  p="sm"
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "var(--mantine-spacing-sm)",
                  }}
                >
                  {visibleGroups.map((group) => (
                    <UnstyledButton
                      key={group.id}
                      ref={(element) => {
                        if (element) compactGroupItemRefs.current.set(group.id, element)
                        else compactGroupItemRefs.current.delete(group.id)
                      }}
                      onClick={() => openDetail(group.id)}
                      p="xs"
                      bdrs="sm"
                      w={240}
                    >
                      <Stack gap={6}>
                        <Text
                          fw={600}
                          size="sm"
                          truncate="end"
                          title={group.name}
                        >
                          {group.name}
                        </Text>
                        <PreviewGrid
                          count={group.previewCount}
                          remote={groupsData !== undefined}
                          sources={
                            group.id === selectedId
                              ? (mediaItemsData ?? []).flatMap((item) =>
                                  item.src ? [item.src] : [],
                                )
                              : []
                          }
                        />
                      </Stack>
                    </UnstyledButton>
                  ))}
                </Box>
              </ScrollArea>
            </Box>
          ) : (
            <Box h="100%" style={{ display: "flex", flexDirection: "column" }}>
              <Box
                pb="xs"
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) auto",
                  alignItems: "center",
                  gap: "var(--mantine-spacing-xs)",
                }}
              >
                <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                  <Text
                    fw={700}
                    truncate="end"
                    ref={compactDetailHeadingRef}
                    tabIndex={-1}
                  >
                    {selected?.name ?? ""}
                  </Text>
                </Group>
                <Button
                  size="xs"
                  variant="default"
                  leftSection={<IconX size={16} />}
                  onClick={closeDetail}
                >
                  一覧に戻る
                </Button>
              </Box>
              <Divider />
              {relationCandidateFeedback}
              {relationDetailSection}
              <Divider />
              <ScrollArea flex={1}>
                <Box p="sm">
                  {mediaDetailState === "loading" ? (
                    <Center mih={180}><Loader /></Center>
                  ) : mediaDetailState === "error" ? (
                    <Alert color="red" title="GroupのMediaを取得できませんでした">
                      <Stack gap="xs" align="flex-start">
                        <Text size="sm">最新のGroup情報を確認するため、再取得してください。</Text>
                        <Button size="xs" variant="light" onClick={() => void onRetryGroupMedia?.()}>
                          再試行
                        </Button>
                      </Stack>
                    </Alert>
                  ) : (selected?.mediaCount ?? 0) === 0 ? (
                    <Paper withBorder p="xl" ta="center">
                      <Text fw={600}>Mediaがありません</Text>
                      <Text size="sm" c="dimmed" mt={4}>
                        このGroupまたはその下位Groupに分類されたMediaはありません。
                      </Text>
                    </Paper>
                  ) : (
                    <>
                      <MediaGrid onOpen={openMediaAt} items={mediaItemsData} />
                      {mediaPageFeedback}
                    </>
                  )}
                </Box>
              </ScrollArea>
            </Box>
          )}
        </Box>
      ) : (
        <SplitView.Root
          groupRef={splitViewRef}
          defaultLayout={{ groups: 100, detail: 0 }}
          onLayoutChanged={handleLayoutChanged}
          style={{ height: "calc(100vh - 88px)" }}
        >
          <SplitView.Pane id="groups" minWidth={264}>
            <Box
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                minHeight: 0,
              }}
            >
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
                  <Group
                    component="form"
                    onSubmit={(event) => {
                      event.preventDefault()
                      setAppliedQuery(query)
                    }}
                    gap="xs"
                    wrap="nowrap"
                    style={{ minWidth: 0 }}
                  >
                    <TextInput
                      w={compact ? "100%" : 280}
                      maw="100%"
                      size="xs"
                      value={query}
                      onChange={(event) => setQuery(event.currentTarget.value)}
                      placeholder="Groupを検索"
                      leftSection={<IconSearch size={16} />}
                      style={{ flex: compact ? "1 1 auto" : undefined }}
                    />
                    <Button size="xs" type="submit">
                      検索
                    </Button>
                  </Group>
                </Box>
                <Group
                  gap="xs"
                  wrap="nowrap"
                  justify="flex-end"
                  style={{ gridColumn: compact ? "1" : undefined }}
                >
                  {!hideManagementActions && (
                  <Button
                    size="xs"
                    leftSection={<IconFolderPlus size={16} />}
                    onClick={openCreate}
                    disabled={!canManage}
                  >
                    Groupを作成
                  </Button>
                  )}
                </Group>
              </Box>
              <Divider />
              <ScrollArea flex={1}>
                <Box
                  p="sm"
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "var(--mantine-spacing-sm)",
                  }}
                >
                  {visibleGroups.map((group) => {
                    const selectedItem = group.id === selectedId
                    return (
                      <UnstyledButton
                        key={group.id}
                        onClick={() => openDetail(group.id)}
                        aria-pressed={selectedItem}
                        w={240}
                        p="xs"
                        bdrs="sm"
                        bg={
                          selectedItem
                            ? "var(--mantine-color-default-hover)"
                            : undefined
                        }
                        style={{
                          border: selectedItem
                            ? "1px solid var(--mantine-primary-color-filled)"
                            : "1px solid transparent",
                        }}
                      >
                        <Stack gap={6}>
                          <Text
                            fw={600}
                            size="sm"
                            truncate="end"
                            title={group.name}
                          >
                            {group.name}
                          </Text>
                          <PreviewGrid
                            count={group.previewCount}
                            remote={groupsData !== undefined}
                          />
                        </Stack>
                      </UnstyledButton>
                    )
                  })}
                </Box>
              </ScrollArea>
            </Box>
          </SplitView.Pane>

          <SplitView.Separator
            style={{ visibility: selectedId ? "visible" : "hidden" }}
          />

          <SplitView.Pane
            id="detail"
            minWidth={360}
            collapsible
            collapsedSize={0}
          >
            <AnimatePresence onExitComplete={handleDetailExitComplete}>
              {selectedId && (
                <motion.div
                  style={{ height: "100%" }}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box
                    style={{
                      display: selectedId ? "flex" : "none",
                      flexDirection: "column",
                      minWidth: 0,
                      minHeight: 0,
                      height: "100%",
                    }}
                  >
                    <Box
                      pb="xs"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "minmax(0, 1fr) auto",
                        alignItems: "center",
                        gap: "var(--mantine-spacing-xs)",
                      }}
                    >
                      <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                        <Text fw={700} truncate="end">
                          {selected?.name ?? ""}
                        </Text>
                      </Group>
                      <Group gap="xs" wrap="nowrap" justify="flex-end">
                        {!hideManagementActions && (
                        <Button
                          size="xs"
                          variant="default"
                          leftSection={<IconEdit size={16} />}
                          onClick={openEdit}
                          disabled={!canManage || !detailsReady}
                        >
                          編集
                        </Button>
                        )}
                        <Button
                          size="xs"
                          variant="default"
                          leftSection={<IconX size={16} />}
                          onClick={closeDetail}
                        >
                          閉じる
                        </Button>
                      </Group>
                    </Box>
                    <Divider />
                    {relationCandidateFeedback}

                    {relationDetailSection}
                    <Divider />

                    <ScrollArea flex={1}>
                      <Box p="sm">
                        {mediaDetailState === "loading" ? (
                          <Center mih={180}><Loader /></Center>
                        ) : mediaDetailState === "error" ? (
                          <Alert color="red" title="GroupのMediaを取得できませんでした">
                            <Stack gap="xs" align="flex-start">
                              <Text size="sm">最新のGroup情報を確認するため、再取得してください。</Text>
                              <Button size="xs" variant="light" onClick={() => void onRetryGroupMedia?.()}>
                                再試行
                              </Button>
                            </Stack>
                          </Alert>
                        ) : (selected?.mediaCount ?? 0) === 0 ? (
                          <Paper withBorder p="xl" ta="center">
                            <Text fw={600}>Mediaがありません</Text>
                            <Text size="sm" c="dimmed" mt={4}>
                              このGroupまたはその下位Groupに分類されたMediaはありません。
                            </Text>
                          </Paper>
                        ) : (
                          <>
                            <MediaGrid
                              onOpen={openMediaAt}
                              items={mediaItemsData}
                            />
                            {mediaPageFeedback}
                          </>
                        )}
                      </Box>
                    </ScrollArea>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          </SplitView.Pane>
        </SplitView.Root>
      )}
      <MediaDetailDialog
        items={groupMediaItems}
        groupOptions={candidates}
        groupMemberships={groupMemberships}
        onSaveGroups={onSaveMediaGroups}
        initialId={
          imageDetailIndex !== null
            ? groupMediaItems[imageDetailIndex]?.id
            : undefined
        }
        onClose={() => setMediaDetailIndex(null)}
        contextKind={contextKind}
      />
    </>
  )
}
