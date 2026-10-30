"use client"

import { useMediaQuery } from "@mantine/hooks"
import { gql, useApolloClient, useMutation, useQuery } from "@apollo/client"
import { Button, Group, Text } from "@mantine/core"
import { useState } from "react"
import { Modal } from "@/components/Modal"
import { showNotification } from "@/components/Feedback"
import { useEffect, useRef } from "react"
import { MediaDetailViewer } from "./MediaDetailViewer"
import { TagsEditModal } from "./TagsEditModal"
import { GroupsEditModal } from "./GroupsEditModal"
import { useMediaDetailEditing } from "./useMediaDetailEditing"
import { useMediaDetailViewport } from "./useMediaDetailViewport"
import { useResponsiveViewport } from "@/hooks/useResponsiveViewport"
import { useMediaDetailPresentation } from "./useMediaDetailPresentation"
import { useMediaDetailUrl } from "./MediaDetailUrlProvider"
import { getMediaNavigation } from "./mediaDetailNavigation"
import type { MediaDetailScope } from "./useMediaDetailRead"

const DELETE_MEDIA = gql`
  mutation MediaDetailDelete($input: DeleteMediaInput!) {
    deleteMedia(input: $input) { mediaId status }
  }
`

const TAG_EDIT_STATE = gql`
  query MediaDetailTagEditState($mediaId: ID!, $scope: ScopeInput!) {
    mediaTagEditState(mediaId: $mediaId, scope: $scope) { mediaId tagIds stateToken }
  }
`
const UPDATE_MEDIA_TAGS = gql`
  mutation MediaDetailUpdateTags($input: UpdateMediaTagsInput!) {
    updateMediaTags(input: $input) { mediaId stateToken }
  }
`

const MEDIA_DETAIL_GROUP_OPTIONS = gql`
  query MediaDetailGroupOptions($scope: ScopeInput!, $after: String) {
    mediaGroups(scope: $scope, first: 100, after: $after) {
      edges { node { id name } }
      pageInfo { hasNextPage endCursor }
    }
  }
`
const MEDIA_DETAIL_ADD_GROUP = gql`
  mutation MediaDetailAddToGroup($input: ChangeMediaGroupClassificationInput!) {
    addMediaToGroup(input: $input) { results { mediaId status errorCode } }
  }
`
const MEDIA_DETAIL_REMOVE_GROUP = gql`
  mutation MediaDetailRemoveFromGroup($input: ChangeMediaGroupClassificationInput!) {
    removeMediaFromGroup(input: $input) { results { mediaId status errorCode } }
  }
`

/**
 * Application-level controller for the ORIGINAL Viewer, not an alternative UI.
 * Never enable fixture-only mutation actions for URL/GraphQL selections.
 */
export function MediaDetailUrlController({
  scope,
  wrap = false,
  initialInfoWide,
  initialInfoMedium,
  dateFormat,
  fileSizeUnit,
}: {
  scope: MediaDetailScope
  wrap?: boolean
  initialInfoWide?: boolean
  initialInfoMedium?: boolean
  dateFormat?: "YYYY_MM_DD" | "MM_DD_YYYY" | "DD_MM_YYYY"
  fileSizeUnit?: "DECIMAL" | "BINARY"
}) {
  const url = useMediaDetailUrl()
  const apollo = useApolloClient()
  const presentation = useMediaDetailPresentation(scope)
  const navigation = getMediaNavigation(url.snapshot, url.selectedMediaId, wrap)
  const viewport = useMediaDetailViewport()
  const { category: viewportCategory, isResolved: viewportResolved } =
    useResponsiveViewport()
  const initializedInfoForOpenSession = useRef(false)
  useEffect(() => {
    if (!url.selectedMediaId) {
      initializedInfoForOpenSession.current = false
      return
    }
    if (initializedInfoForOpenSession.current || !viewportResolved) return
    // Initial preference applies once per open session; manual panel toggles and paging win afterward.
    viewport.setDetailInfoOpened(
      viewportCategory === "wide"
        ? (initialInfoWide ?? true)
        : viewportCategory === "medium"
          ? (initialInfoMedium ?? true)
          : true,
    )
    initializedInfoForOpenSession.current = true
  }, [
    url.selectedMediaId,
    viewportResolved,
    viewportCategory,
    initialInfoWide,
    initialInfoMedium,
    viewport.setDetailInfoOpened,
  ])

  const editing = useMediaDetailEditing(null)

  const [tagTarget, setTagTarget] = useState<string | null>(null)
  const [tagDraft, setTagDraft] = useState<string[]>([])
  const [savingTags, setSavingTags] = useState(false)
  const tagEdit = useQuery<{
    mediaTagEditState: { mediaId: string; tagIds: string[]; stateToken: string }
  }>(TAG_EDIT_STATE, {
    variables: { mediaId: tagTarget ?? "", scope },
    skip: tagTarget === null,
    fetchPolicy: "network-only",
  })
  const [updateTags] = useMutation<{
    updateMediaTags: { mediaId: string; stateToken: string }
  }>(UPDATE_MEDIA_TAGS)
  const openTagEditor = () => {
    const id = presentation.selectedMediaId
    if (!id || presentation.tags.kind !== "ready") return
    setTagDraft(presentation.tags.values.map((tag) => tag.name))
    setTagTarget(id)
  }
  const saveTags = async () => {
    const id = tagTarget
    const state = tagEdit.data?.mediaTagEditState
    const tags = presentation.tags
    if (
      !id ||
      savingTags ||
      presentation.selectedMediaId !== id ||
      !state ||
      state.mediaId !== id ||
      tags.kind !== "ready"
    )
      return
    const currentIds = tags.values.map((tag) => tag.id).sort()
    if (
      JSON.stringify(currentIds) !== JSON.stringify([...state.tagIds].sort())
    ) {
      showNotification({
        kind: "error",
        title: "Tagsの状態が変更されています",
        description: "最新のTagsを取得してから編集してください。",
      })
      setTagTarget(null)
      void presentation.retryDetail()
      return
    }
    const existing = new Map(tags.values.map((tag) => [tag.name, tag.id]))
    const uniqueNames = [
      ...new Set(tagDraft.map((name) => name.trim()).filter(Boolean)),
    ]
    setSavingTags(true)
    try {
      const result = await updateTags({
        variables: {
          input: {
            mediaId: id,
            scope,
            expectedStateToken: state.stateToken,
            tags: uniqueNames.map((name) => ({
              id: existing.get(name) ?? null,
              name,
            })),
          },
        },
      })
      if (result.data?.updateMediaTags.mediaId !== id)
        throw new Error("Unexpected Media ID")
      setTagTarget(null)
      await presentation.retryDetail()
      showNotification({
        kind: "success",
        title: "Tagsを更新",
        description: "MediaのTagを保存しました。",
      })
    } catch {
      showNotification({
        kind: "error",
        title: "Tagsを保存できませんでした",
        description:
          "競合または結果不明の可能性があります。最新の状態を確認してください。",
      })
      setTagTarget(null)
      void presentation.retryDetail()
    } finally {
      setSavingTags(false)
    }
  }

  const [groupTarget, setGroupTarget] = useState<string | null>(null)
  const [groupDraft, setGroupDraft] = useState<string[]>([])
  const [savingGroups, setSavingGroups] = useState(false)
  const groupOptions = useQuery<{
    mediaGroups: {
      edges: { node: { id: string; name: string } }[]
      pageInfo: { hasNextPage: boolean; endCursor: string | null }
    }
  }>(MEDIA_DETAIL_GROUP_OPTIONS, {
    variables: { scope },
    skip: groupTarget === null,
    fetchPolicy: "network-only",
  })
  const [groupOptionsPageError, setGroupOptionsPageError] = useState(false)
  const groupOptionsPageInFlight = useRef<string | null>(null)
  const nextGroupCursor = groupOptions.data?.mediaGroups.pageInfo.hasNextPage
    ? groupOptions.data.mediaGroups.pageInfo.endCursor
    : null
  useEffect(() => {
    if (
      !groupTarget ||
      !nextGroupCursor ||
      groupOptions.loading ||
      groupOptions.error ||
      groupOptionsPageError ||
      groupOptionsPageInFlight.current !== null
    )
      return
    const key = JSON.stringify([groupTarget, scope, nextGroupCursor])
    groupOptionsPageInFlight.current = key
    void groupOptions
      .fetchMore({
        variables: { after: nextGroupCursor },
        updateQuery(previous, { fetchMoreResult }) {
          if (!fetchMoreResult) return previous
          const seen = new Set(
            previous.mediaGroups.edges.map(({ node }) => node.id),
          )
          return {
            mediaGroups: {
              ...fetchMoreResult.mediaGroups,
              edges: [
                ...previous.mediaGroups.edges,
                ...fetchMoreResult.mediaGroups.edges.filter(({ node }) => {
                  if (seen.has(node.id)) return false
                  seen.add(node.id)
                  return true
                }),
              ],
            },
          }
        },
      })
      .catch(() => setGroupOptionsPageError(true))
      .finally(() => {
        if (groupOptionsPageInFlight.current === key)
          groupOptionsPageInFlight.current = null
      })
  }, [
    groupTarget,
    nextGroupCursor,
    groupOptions.loading,
    groupOptions.error,
    groupOptionsPageError,
    groupOptions.fetchMore,
    scope,
  ])
  const retryGroupOptions = () => {
    setGroupOptionsPageError(false)
    groupOptionsPageInFlight.current = null
    void groupOptions.refetch({ after: null })
  }
  const [addToGroup] = useMutation<{
    addMediaToGroup: { results: { mediaId: string; status: string }[] }
  }>(MEDIA_DETAIL_ADD_GROUP)
  const [removeFromGroup] = useMutation<{
    removeMediaFromGroup: { results: { mediaId: string; status: string }[] }
  }>(MEDIA_DETAIL_REMOVE_GROUP)
  const openGroupEditor = () => {
    const id = presentation.selectedMediaId
    if (!id || presentation.groups.kind !== "ready") return
    setGroupOptionsPageError(false)
    setGroupDraft(presentation.groups.values.map((item) => item.name))
    setGroupTarget(id)
  }
  const saveGroups = async () => {
    const id = groupTarget
    const groups = presentation.groups
    const catalog = groupOptions.data?.mediaGroups
    if (
      !id ||
      savingGroups ||
      presentation.selectedMediaId !== id ||
      groups.kind !== "ready" ||
      !catalog ||
      catalog.pageInfo.hasNextPage ||
      groupOptions.error ||
      groupOptionsPageError
    )
      return
    const byName = new Map(
      catalog.edges.map(({ node }) => [node.name, node.id]),
    )
    const original = new Map(groups.values.map((item) => [item.name, item.id]))
    const desired = [...new Set(groupDraft)]
    if (desired.some((name) => !byName.has(name))) {
      showNotification({
        kind: "error",
        title: "Groupsを保存できませんでした",
        description:
          "Group候補が変更されました。最新の一覧を取得してください。",
      })
      return
    }
    const removed = [...original.values()].filter(
      (groupId) => !desired.some((name) => byName.get(name) === groupId),
    )
    const added = desired
      .map((name) => byName.get(name)!)
      .filter((groupId) => ![...original.values()].includes(groupId))
    setSavingGroups(true)
    try {
      for (const groupId of removed) {
        const result = await removeFromGroup({
          variables: { input: { groupId, mediaIds: [id] } },
        })
        const response = result.data?.removeMediaFromGroup.results
        if (
          !response ||
          response.length !== 1 ||
          response[0].mediaId !== id ||
          !["SUCCEEDED", "ALREADY_APPLIED"].includes(response[0].status)
        ) {
          throw new Error("Group removal was not confirmed")
        }
      }
      for (const groupId of added) {
        const result = await addToGroup({
          variables: { input: { groupId, mediaIds: [id] } },
        })
        const response = result.data?.addMediaToGroup.results
        if (
          !response ||
          response.length !== 1 ||
          response[0].mediaId !== id ||
          !["SUCCEEDED", "ALREADY_APPLIED"].includes(response[0].status)
        ) {
          throw new Error("Group addition was not confirmed")
        }
      }
      setGroupTarget(null)
      showNotification({
        kind: "success",
        title: "Groupsを更新",
        description: "MediaのGroup分類を保存しました。",
      })
    } catch {
      setGroupTarget(null)
      showNotification({
        kind: "error",
        title: "Groupsの変更結果を確認できませんでした",
        description:
          "一部の変更が反映された可能性があります。最新の所属状態を確認してください。",
      })
    } finally {
      setSavingGroups(false)
      void presentation.retryDetail()
      void apollo
        .refetchQueries({ include: ["BrowseGroupDetail", "BrowseGroups"] })
        .catch(() => {})
    }
  }
  const compact = useMediaQuery("(max-width: 47.99em)")
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState(false)
  const [deleteMutation, { loading: deleting }] = useMutation<
    { deleteMedia: { mediaId: string; status: string } },
    { input: { mediaId: string; idempotencyKey: string } }
  >(DELETE_MEDIA)
  const deletionKey = useRef<{ mediaId: string; key: string } | null>(null)
  const deleteConfirmed = async () => {
    if (!deleteTarget || deleting) return
    const mediaId = deleteTarget
    if (!deletionKey.current || deletionKey.current.mediaId !== mediaId) {
      deletionKey.current = { mediaId, key: crypto.randomUUID() }
    }
    setDeleteError(false)
    try {
      const response = await deleteMutation({
        variables: {
          input: { mediaId, idempotencyKey: deletionKey.current.key },
        },
      })
      if (
        response.data?.deleteMedia.mediaId !== mediaId ||
        response.data.deleteMedia.status !== "DELETING"
      ) {
        setDeleteError(true)
        return
      }
      setDeleteTarget(null)
      deletionKey.current = null
      url.closeMediaDetail()
      // The mutation acknowledges DELETING; refresh visible lists separately.
      // A list-refresh failure must not reinterpret an accepted deletion as failure.
      void apollo
        .refetchQueries({
          include: [
            "MediaBrowserList",
            "DashboardRecentMedia",
            "BrowseGroupDetail",
          ],
        })
        .catch(() => {
          showNotification({
            kind: "error",
            title: "一覧を更新できませんでした",
            description:
              "削除処理は受け付けられました。一覧を再読み込みしてください。",
          })
        })
      showNotification({
        kind: "success",
        title: "Mediaの削除",
        description: "削除処理を受け付けました。",
      })
    } catch {
      setDeleteError(true)
    }
  }
  const previousId = useRef<string | null>(null)
  useEffect(() => {
    const nextId = presentation.selectedMediaId
    if (previousId.current !== nextId) {
      if (previousId.current !== null) {
        setTagTarget(null)
        setTagDraft([])
        setGroupTarget(null)
        setGroupDraft([])
        viewport.setDetailZoom(100)
        viewport.setDetailRotate(0)
        viewport.setDetailRotateAnimated(false)
      }
      previousId.current = nextId
    }
  }, [
    presentation.selectedMediaId,
    viewport.setDetailZoom,
    viewport.setDetailRotate,
    viewport.setDetailRotateAnimated,
  ])

  return (
    <>
      <MediaDetailViewer
        detail={null}
        selectedId={presentation.selectedMediaId}
        navigation={navigation}
        navigateById={(direction) => url.navigateMediaDetail(direction, wrap)}
        setDetail={() => undefined}
        closeMediaDetail={url.closeMediaDetail}
        onRequestDelete={() => {
          if (presentation.selectedMediaId && scope.type === "PERSONAL") {
            setDeleteTarget(presentation.selectedMediaId)
            setDeleteError(false)
          }
        }}
        allowDelete={scope.type === "PERSONAL"}
        onEditTags={openTagEditor}
        onEditGroups={openGroupEditor}
        stateItems={[]}
        compact={compact}
        context={scope.type === "COMMUNITY" ? "community" : "personal"}
        downloadMock="forbidden"
        detailValues={editing.detailValues}
        detailSectionsExpanded={editing.detailSectionsExpanded}
        toggleDetailSection={editing.toggleDetailSection}
        openDetailEditor={editing.openDetailEditor}
        setUnshareTarget={editing.setUnshareTarget}
        setShareTarget={editing.setShareTarget}
        setDetailEditor={editing.setDetailEditor}
        prepareNavigation={viewport.prepareNavigation}
        detailInfoOpened={viewport.detailInfoOpened}
        setDetailInfoOpened={viewport.setDetailInfoOpened}
        detailZoom={viewport.detailZoom}
        setDetailZoom={viewport.setDetailZoom}
        detailRotate={viewport.detailRotate}
        setDetailRotate={viewport.setDetailRotate}
        detailRotateAnimated={viewport.detailRotateAnimated}
        setDetailRotateAnimated={viewport.setDetailRotateAnimated}
        detailDirection={viewport.detailDirection}
        read={{
          detail: presentation.detail,
          preview: presentation.preview,
          groups: presentation.groups,
          tags: presentation.tags,
          retryDetail: presentation.retryDetail,
          retryImage: presentation.retryDetail,
          pollingStopped: presentation.pollingStopped,
          dateFormat,
          fileSizeUnit,
        }}
      />
      <GroupsEditModal
        detailEditor={groupTarget ? "groups" : null}
        setDetailEditor={(value) => {
          if (savingGroups || typeof value === "function") return
          if (value === null) setGroupTarget(null)
        }}
        detailDraft={groupDraft}
        setDetailDraft={setGroupDraft}
        saveDetailDraft={saveGroups}
        groupOptions={
          groupOptions.data?.mediaGroups.edges.map(({ node }) => node.name) ??
          []
        }
        pending={
          savingGroups ||
          groupOptions.loading ||
          (!groupOptions.data && !groupOptions.error) ||
          Boolean(
            groupOptions.data?.mediaGroups.pageInfo.hasNextPage &&
              !groupOptionsPageError &&
              groupOptions.data.mediaGroups.pageInfo.endCursor,
          )
        }
        loadError={Boolean(
          groupOptions.error ||
            groupOptionsPageError ||
            (groupOptions.data?.mediaGroups.pageInfo.hasNextPage &&
              !groupOptions.data.mediaGroups.pageInfo.endCursor),
        )}
        onRetryLoad={retryGroupOptions}
      />
      <TagsEditModal
        detailEditor={tagTarget ? "tags" : null}
        setDetailEditor={(value) => {
          if (savingTags || typeof value === "function") return
          if (value === null) setTagTarget(null)
        }}
        detailDraft={tagDraft}
        setDetailDraft={setTagDraft}
        saveDetailDraft={saveTags}
        pending={
          savingTags || tagEdit.loading || (!tagEdit.data && !tagEdit.error)
        }
        loadError={Boolean(tagEdit.error)}
        onRetryLoad={() => {
          void tagEdit.refetch()
        }}
        options={
          presentation.tags.kind === "ready"
            ? presentation.tags.values.map((tag) => tag.name)
            : []
        }
      />
      <Modal
        opened={deleteTarget !== null}
        onClose={() => {
          if (!deleting) {
            setDeleteTarget(null)
            deletionKey.current = null
          }
        }}
        title="Mediaを削除"
        size="md"
      >
        <Modal.Body>
          <Text size="sm">
            このMediaを削除します。削除したMediaは復元できません。
          </Text>
          {deleteError && (
            <Text size="sm" c="red" role="alert">
              削除結果を確認できませんでした。最新の状態を確認してから再試行してください。
            </Text>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Group justify="flex-end">
            <Button
              variant="default"
              disabled={deleting}
              onClick={() => {
                setDeleteTarget(null)
                deletionKey.current = null
              }}
            >
              キャンセル
            </Button>
            <Button
              color="red"
              loading={deleting}
              onClick={() => void deleteConfirmed()}
            >
              削除
            </Button>
          </Group>
        </Modal.Footer>
      </Modal>
    </>
  )
}
