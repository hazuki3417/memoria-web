"use client"

import {
  Box,
  Group,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
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
import { GroupBrowserListPane } from "./GroupBrowserListPane"
import { useGroupMutationAction } from "./useGroupMutationAction"
import { filterVisibleGroups } from "./groupSearch"
import { useGroupSearchState } from "./useGroupSearchState"
import { useGroupNavigation } from "./useGroupNavigation"
import { useGroupCreateController } from "./useGroupCreateController"

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
  discoveryPageState?: "idle" | "loading" | "error"
  onRetryDiscoveryPage?: () => void
  onDiscoveryEndVisible?: () => void
  onMediaEndVisible?: () => void
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
  discoveryState = "ready",
  onRetryDiscovery,
  discoveryPageState = "idle",
  onRetryDiscoveryPage,
  onDiscoveryEndVisible,
  onMediaEndVisible,
}: GroupBrowserProps) {
  const { saving, runAction } = useGroupMutationAction()
  const {
    createOpened,
    createName,
    createParents,
    createChildren,
    setCreateName,
    setCreateParents,
    setCreateChildren,
    openCreate,
    submitCreate,
    closeCreate,
  } = useGroupCreateController({ onCreateGroup, runAction })
  const allGroups = groupsData ?? []
  const { query, setQuery, appliedQuery, setAppliedQuery } =
    useGroupSearchState()
  const {
    selectedId,
    compact,
    compactView,
    splitViewRef,
    savedLayout,
    compactDetailHeadingRef,
    compactSearchRef,
    compactGroupItemRefs,
    compactReturnGroupIdRef,
    openDetail,
    closeDetail,
    handleDetailExitComplete,
    handleLayoutChanged,
  } = useGroupNavigation(onSelectGroup)
  const [imageDetailIndex, setMediaDetailIndex] = useState<number | null>(null)
  const groupMediaItems = useMemo(
    () =>
      (mediaItemsData ?? []).map((item) => ({
        ...item,
        src: item.src ?? "",
        failed: !item.src,
      })),
    [mediaItemsData],
  )

  const openMediaAt = (index: number) => {
    const id = mediaItemsData?.[index]?.id
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
    () =>
      filterVisibleGroups(allGroups, appliedQuery, groupsData !== undefined),
    [allGroups, appliedQuery, groupsData],
  )

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
      candidates={candidates ?? []}
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
          description:
            "通信状態が不明です。編集内容を保持しています。最新状態を確認してから操作してください。",
        })
      }
      return
    }
    if (result === "error") {
      showNotification({
        kind: "error",
        title: "Groupを更新できませんでした",
        description: "最新のGroup情報を確認してから、再度お試しください。",
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
      candidates={candidates ?? []}
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
<GroupBrowserListPane
                compact={true}
                query={query}
                onQueryChange={setQuery}
                onSearch={() => setAppliedQuery(query)}
                searchRef={compactSearchRef}
                hideManagementActions={hideManagementActions}
                canManage={canManage}
                onCreate={openCreate}
                visibleGroups={visibleGroups}
                discoveryState={discoveryState}
                groupsLoaded={groupsData !== undefined}
                selectedId={selectedId}
                mediaItemsData={mediaItemsData}
                compactGroupItemRefs={compactGroupItemRefs}
                onOpenDetail={openDetail}
                groupCount={allGroups.length}
                appliedQuery={appliedQuery}
                onClearSearch={() => { setQuery(""); setAppliedQuery("") }}
                onRetryDiscovery={onRetryDiscovery}
                onRetryDiscoveryPage={onRetryDiscoveryPage}
                discoveryPageState={discoveryPageState}
                onDiscoveryEndVisible={onDiscoveryEndVisible}
              />
          ) : (
            <GroupDetailPane
              compact
              selected={selected}
              mediaDetailState={mediaDetailState}
              mediaItemsData={mediaItemsData}
              onRetryGroupMedia={onRetryGroupMedia}
              onMediaEndVisible={onMediaEndVisible}
              onOpenMedia={openMediaAt}
              mediaPageFeedback={mediaPageFeedback}
              relationCandidateFeedback={relationCandidateFeedback}
              relationDetailSection={relationDetailSection}
              hideManagementActions={hideManagementActions}
              canManage={canManage}
              detailsReady={detailsReady}
              onEdit={openEdit}
              onClose={closeDetail}
              headingRef={compactDetailHeadingRef}
            />
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
<GroupBrowserListPane
                compact={false}
                query={query}
                onQueryChange={setQuery}
                onSearch={() => setAppliedQuery(query)}
                
                hideManagementActions={hideManagementActions}
                canManage={canManage}
                onCreate={openCreate}
                visibleGroups={visibleGroups}
                discoveryState={discoveryState}
                groupsLoaded={groupsData !== undefined}
                selectedId={selectedId}
                mediaItemsData={mediaItemsData}
                compactGroupItemRefs={compactGroupItemRefs}
                onOpenDetail={openDetail}
                groupCount={allGroups.length}
                appliedQuery={appliedQuery}
                onClearSearch={() => { setQuery(""); setAppliedQuery("") }}
                onRetryDiscovery={onRetryDiscovery}
                onRetryDiscoveryPage={onRetryDiscoveryPage}
                discoveryPageState={discoveryPageState}
                onDiscoveryEndVisible={onDiscoveryEndVisible}
              />
          </SplitView.Pane>

          <SplitView.Separator
            style={{
              visibility: selectedId ? "visible" : "hidden",
              width: selectedId ? 17 : 0,
              flexBasis: selectedId ? 17 : 0,
            }}
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
                  <GroupDetailPane
                    selected={selected}
                    mediaDetailState={mediaDetailState}
                    mediaItemsData={mediaItemsData}
                    onRetryGroupMedia={onRetryGroupMedia}
                    onMediaEndVisible={onMediaEndVisible}
                    onOpenMedia={openMediaAt}
                    mediaPageFeedback={mediaPageFeedback}
                    relationCandidateFeedback={relationCandidateFeedback}
                    relationDetailSection={relationDetailSection}
                    hideManagementActions={hideManagementActions}
                    canManage={canManage}
                    detailsReady={detailsReady}
                    onEdit={openEdit}
                    onClose={closeDetail}
                  />
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
