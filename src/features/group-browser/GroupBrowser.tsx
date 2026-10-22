"use client"

import {
  Alert,
  Box,
  Button,
  Divider,
  Group,
  Center,
  Loader,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import {
  IconFolderPlus,
  IconSearch,
} from "@tabler/icons-react"
import { AnimatePresence, motion } from "framer-motion"
import { useMemo, useState } from "react"
import { showNotification } from "@/components/Feedback"
import { SplitView } from "@/components/SplitView"
import { MediaDetailDialog } from "@/features/media-detail"
import { validGroupName } from "./groupName"
import { MediaGrid } from "./MediaGrid"
import { GroupRelationSection } from "./GroupRelationSection"
import { GroupDetailPane } from "./GroupDetailPane"
import { GroupMediaPageFeedback } from "./GroupMediaPageFeedback"
import { GroupRelationCandidateFeedback } from "./GroupRelationCandidateFeedback"
import { GroupDeleteDialog } from "./GroupDeleteDialog"
import { GroupCreateDialog } from "./GroupCreateDialog"
import { GroupEditDialog } from "./GroupEditDialog"
import { useGroupMutationAction } from "./useGroupMutationAction"
import { filterVisibleGroups } from "./groupSearch"
import { useGroupSearchState } from "./useGroupSearchState"
import { useGroupNavigation } from "./useGroupNavigation"
import { useGroupCreateController } from "./useGroupCreateController"
import { GroupPreviewGrid as PreviewGrid, previewImages } from "./GroupPreviewGrid"

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
  ) => Promise<"unknown" | void>
  onUpdateGroup?: (
    id: string,
    name: string,
    parents: string[],
    children: string[],
  ) => Promise<"conflict" | "unknown" | void>
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
  discoveryState?: "ready" | "loading" | "error"
  onRetryDiscovery?: () => void
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
  discoveryState = "ready",
  onRetryDiscovery,
}: GroupBrowserProps) {
  const { saving, runAction } = useGroupMutationAction()
  const {
    createdGroups, createOpened, createName, createParents, createChildren,
    setCreateName, setCreateParents, setCreateChildren, openCreate, submitCreate,
    closeCreate,
  } = useGroupCreateController({ onCreateGroup, runAction })
  const allGroups = useMemo(
    () => [...(groupsData ?? groups), ...createdGroups],
    [groupsData, createdGroups],
  )
  const { query, setQuery, appliedQuery, setAppliedQuery } = useGroupSearchState()
  const {
    selectedId, compact, compactView, splitViewRef, savedLayout,
    compactDetailHeadingRef, compactSearchRef, compactGroupItemRefs,
    compactReturnGroupIdRef, openDetail, closeDetail,
    handleDetailExitComplete, handleLayoutChanged,
  } = useGroupNavigation(onSelectGroup)
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

  const [relationsOpened, relations] = useDisclosure(false)
  const [editOpened, edit] = useDisclosure(false)
  const [deleteOpened, deletion] = useDisclosure(false)
  const [draftName, setDraftName] = useState("")
  const [draftParents, setDraftParents] = useState<string[]>([])
  const [draftChildren, setDraftChildren] = useState<string[]>([])
  const [conflictNeedsReview, setConflictNeedsReview] = useState(false)

  const visibleGroups = useMemo(
    () => filterVisibleGroups(allGroups, appliedQuery, groupsData !== undefined),
    [allGroups, appliedQuery, groupsData],
  )

  const emptyGroupState = discoveryState === "ready" && allGroups.length === 0 && !appliedQuery.trim() ? (
    <Center mih={360}>
      <Stack align="center" maw={420}>
        <ThemeIcon size={48} radius="xl" variant="light">
          <IconFolderPlus size={24} />
        </ThemeIcon>
        <Text fw={700} size="lg">まだGroupがありません</Text>
        <Text size="sm" c="dimmed" ta="center">
          最初のGroupを作成すると、ここからMediaを整理できます。
        </Text>
        {!hideManagementActions && (
          <Button leftSection={<IconFolderPlus size={16} />} onClick={openCreate} disabled={!canManage}>
            Groupを作成
          </Button>
        )}
      </Stack>
    </Center>
  ) : null

  const discoveryFeedback = discoveryState === "loading" ? (
    <Center mih={360}>
      <Stack align="center">
        <Loader />
        <Text size="sm" c="dimmed">Groupを読み込んでいます</Text>
      </Stack>
    </Center>
  ) : discoveryState === "error" ? (
    <Box p="sm">
      <Alert color="red" title="Group一覧を取得できませんでした">
        <Stack gap="xs" align="flex-start">
          <Text size="sm">Group一覧の取得に失敗しました。再試行できます。</Text>
          <Button size="xs" variant="light" onClick={onRetryDiscovery}>再試行</Button>
        </Stack>
      </Alert>
    </Box>
  ) : null
  const searchEmptyState = discoveryState === "ready" && allGroups.length > 0 && visibleGroups.length === 0 && appliedQuery.trim() ? (
    <Center mih={360}>
      <Stack align="center" maw={420}>
        <ThemeIcon size={48} radius="xl" variant="light" color="gray">
          <IconSearch size={24} />
        </ThemeIcon>
        <Text fw={700} size="lg">一致するGroupがありません</Text>
        <Text size="sm" c="dimmed" ta="center">検索条件を変更するか、検索を解除してください。</Text>
        <Button variant="default" onClick={() => { setQuery(""); setAppliedQuery("") }}>
          検索を解除
        </Button>
      </Stack>
    </Center>
  ) : null

  const selected = allGroups.find((group) => group.id === selectedId) ?? null

  const openEdit = () => {
    if (!selected || !detailsReady || !canManage) return
    setConflictNeedsReview(false)
    setDraftName(selected.name)
    setDraftParents(selected.parentNames)
    setDraftChildren(selected.childNames)
    edit.open()
  }

  const relationCandidateFeedback = (
    <GroupRelationCandidateFeedback
      canManage={canManage}
      hasSelection={Boolean(selected)}
      state={relationCandidateState}
      onRetry={onRetryRelationCandidates}
    />
  )

  const relationDetailSection = (
    <GroupRelationSection
      opened={relationsOpened}
      onToggle={relations.toggle}
      parentNames={selected?.parentNames ?? []}
      childNames={selected?.childNames ?? []}
    />
  )

  const mediaPageFeedback = (
    <GroupMediaPageFeedback state={mediaPageState} onRetry={onRetryMediaPage} />
  )

  const createDialog = (
    <GroupCreateDialog
      opened={createOpened}
      name={createName}
      parents={createParents}
      children={createChildren}
      candidates={candidates ?? relationCandidateNames}
      canManage={canManage}
      saving={saving}
      onNameChange={setCreateName}
      onParentsChange={setCreateParents}
      onChildrenChange={setCreateChildren}
      onClose={closeCreate}
      onSubmit={submitCreate}
    />
  )

  const submitEdit = async () => {
    if (!selected || !validGroupName(draftName)) return
    if (conflictNeedsReview || !detailsReady) return
    let conflict = false
    let uncertain = false
    const result = await runAction(async () => {
      const outcome = await onUpdateGroup?.(
        selected.id,
        draftName.trim(),
        draftParents,
        draftChildren,
      )
      if (outcome === "conflict") conflict = true
      if (outcome === "unknown") uncertain = true
    })
    if (conflict || uncertain) {
      setConflictNeedsReview(true)
      if (uncertain) {
        showNotification({
          kind: "error",
          title: "保存結果を確認できませんでした",
          description: "通信状態が不明です。編集内容を保持しています。最新状態を確認してから操作してください。",
        })
      }
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
  }

  const editDialog = (
    <GroupEditDialog
      opened={editOpened}
      name={draftName}
      parents={draftParents}
      children={draftChildren}
      candidates={candidates ?? relationCandidateNames}
      currentGroupName={selected?.name ?? ""}
      availability={relationAvailability}
      canManage={canManage}
      detailsReady={detailsReady}
      conflictNeedsReview={conflictNeedsReview}
      saving={saving}
      onNameChange={setDraftName}
      onParentsChange={setDraftParents}
      onChildrenChange={setDraftChildren}
      onDelete={deletion.open}
      onClose={edit.close}
      onSubmit={submitEdit}
    />
  )

  const confirmDelete = async () => {
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
  }

  const deleteDialog = (
    <GroupDeleteDialog
      opened={deleteOpened}
      name={selected?.name ?? ""}
      saving={saving}
      canManage={canManage}
      onClose={deletion.close}
      onConfirm={confirmDelete}
    />
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
                {discoveryFeedback}
                {emptyGroupState}
                {searchEmptyState}
                <Box
                  p="sm"
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "var(--mantine-spacing-sm)",
                  }}
                >
                  {(discoveryState === "ready" ? visibleGroups : []).map((group) => (
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
            <GroupDetailPane compact selected={selected} mediaDetailState={mediaDetailState} mediaItemsData={mediaItemsData}
                onRetryGroupMedia={onRetryGroupMedia} onOpenMedia={openMediaAt}
                mediaPageFeedback={mediaPageFeedback} relationCandidateFeedback={relationCandidateFeedback}
                relationDetailSection={relationDetailSection} hideManagementActions={hideManagementActions}
                canManage={canManage} detailsReady={detailsReady} onEdit={openEdit} onClose={closeDetail} headingRef={compactDetailHeadingRef} />
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
                {discoveryFeedback}
                {emptyGroupState}
                {searchEmptyState}
                <Box
                  p="sm"
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "var(--mantine-spacing-sm)",
                  }}
                >
                  {(discoveryState === "ready" ? visibleGroups : []).map((group) => {
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
                  <GroupDetailPane selected={selected} mediaDetailState={mediaDetailState} mediaItemsData={mediaItemsData}
                onRetryGroupMedia={onRetryGroupMedia} onOpenMedia={openMediaAt}
                mediaPageFeedback={mediaPageFeedback} relationCandidateFeedback={relationCandidateFeedback}
                relationDetailSection={relationDetailSection} hideManagementActions={hideManagementActions}
                canManage={canManage} detailsReady={detailsReady} onEdit={openEdit} onClose={closeDetail} />
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
