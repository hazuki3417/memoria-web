"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Alert, Button, Center, Loader, Stack, Text } from "@mantine/core"
import {
  MediaGroupSort,
  CommunityMemberRole,
  useCommunityMembersQuery,
  useCurrentUserQuery,
  ScopeType,
  useBrowseGroupsQuery,
  useBrowseGroupDetailQuery,
  useBrowseGroupRelationCandidatesQuery,
  useCreateBrowserGroupMutation,
  useUpdateBrowserGroupMutation,
  useDeleteBrowserGroupMutation,
  useAddBrowserMediaToGroupMutation,
  useRemoveBrowserMediaFromGroupMutation,
} from "@/infrastructure/graphql/generated"
import { GroupBrowser, type GroupBrowserGroup } from "./GroupBrowser"
import { deleteGroupThenRefresh } from "./groupDeleteFlow"
import { isGroupStateConflict, isGroupUpdateOutcomeUnknown } from "./groupStateConflict"
import { showNotification } from "@/components/Feedback"

type GroupBrowserContainerProps = {
  contextKind: "personal" | "community"
  communityId?: string
}

export function GroupBrowserContainer({
  contextKind,
  communityId,
}: GroupBrowserContainerProps) {
  const scope = useMemo(
    () =>
      contextKind === "community"
        ? { type: ScopeType.Community, communityId }
        : { type: ScopeType.Personal },
    [contextKind, communityId],
  )
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const communityMembers = useCommunityMembersQuery({
    variables: { communityId: communityId ?? "" },
    skip: contextKind !== "community" || !communityId,
  })
  const currentUser = useCurrentUserQuery({ skip: contextKind !== "community" })
  const canManage =
    contextKind === "personal" ||
    Boolean(
      communityMembers.data?.communityMembers.some(
        (member) =>
          member.userId === currentUser.data?.me?.id &&
          member.role === CommunityMemberRole.Admin,
      ),
    )

  const listing = useBrowseGroupsQuery({
    variables: { scope, sort: MediaGroupSort.NameAsc, first: 100 },
    skip: contextKind === "community" && !communityId,
  })
  const detail = useBrowseGroupDetailQuery({
    variables: { id: selectedId ?? "", scope },
    skip: !selectedId,
  })
  const candidateQuery = useBrowseGroupRelationCandidatesQuery({
    variables: { groupId: selectedId ?? "", first: 100 },
    skip: !selectedId,
  })
  const [candidateLoadFailureId, setCandidateLoadFailureId] = useState<string | null>(null)
  const [candidateRetryingId, setCandidateRetryingId] = useState<string | null>(null)
  const candidatePageInFlight = useRef<string | null>(null)
  const retryRelationCandidates = useCallback(async () => {
    if (!selectedId || candidateRetryingId === selectedId) return
    setCandidateRetryingId(selectedId)
    try {
      // Restart at page one, rather than keeping an incomplete candidate set.
      await candidateQuery.refetch()
      setCandidateLoadFailureId(null)
    } catch {
      setCandidateLoadFailureId(selectedId)
    } finally {
      setCandidateRetryingId(null)
    }
  }, [selectedId, candidateRetryingId, candidateQuery.refetch])

  const candidateCursor = candidateQuery.data?.mediaGroupRelationCandidates
    .pageInfo.hasNextPage
    ? candidateQuery.data.mediaGroupRelationCandidates.pageInfo.endCursor
    : null
  useEffect(() => {
    if (
      !selectedId ||
      !candidateCursor ||
      candidateQuery.loading ||
      candidateQuery.error ||
      candidateLoadFailureId === selectedId ||
      candidateRetryingId === selectedId
    ) return
    const requestKey = selectedId + ":" + candidateCursor
    if (candidatePageInFlight.current === requestKey) return
    candidatePageInFlight.current = requestKey
    void candidateQuery.fetchMore({
      variables: { after: candidateCursor },
      updateQuery: (previous, { fetchMoreResult }) => {
        if (!fetchMoreResult) return previous
        const incoming = fetchMoreResult.mediaGroupRelationCandidates
        const seen = new Set(
          previous.mediaGroupRelationCandidates.edges.map(
            (edge) => edge.cursor,
          ),
        )
        return {
          ...previous,
          mediaGroupRelationCandidates: {
            ...incoming,
            edges: [
              ...previous.mediaGroupRelationCandidates.edges,
              ...incoming.edges.filter((edge) => !seen.has(edge.cursor)),
            ],
          },
        }
      },
    })
    .catch(() => {
      // Stop automatic pagination after an error; retry is an explicit action.
      setCandidateLoadFailureId(selectedId)
    })
    .finally(() => {
      if (candidatePageInFlight.current === requestKey) {
        candidatePageInFlight.current = null
      }
    })
  }, [candidateCursor, candidateQuery.loading, candidateQuery.error,
      candidateQuery.fetchMore, candidateLoadFailureId, candidateRetryingId, selectedId])

  const mediaCursor =
    detail.data?.mediaGroup?.id === selectedId &&
    detail.data.mediaGroup.aggregateMedia.pageInfo.hasNextPage
      ? detail.data.mediaGroup.aggregateMedia.pageInfo.endCursor
      : null
  const mediaPageKey = selectedId && mediaCursor ? selectedId + ":" + mediaCursor : null
  const [mediaPageFailedKey, setMediaPageFailedKey] = useState<string | null>(null)
  const mediaPageInFlight = useRef<string | null>(null)

  // Retry the failed cursor explicitly while preserving already loaded Media.
  const retryMediaPage = useCallback(() => {
    if (mediaPageKey && mediaPageFailedKey === mediaPageKey) {
      setMediaPageFailedKey(null)
    }
  }, [mediaPageKey, mediaPageFailedKey])

  useEffect(() => {
    if (
      !mediaPageKey || !mediaCursor || !selectedId ||
      detail.loading ||
      mediaPageFailedKey === mediaPageKey ||
      mediaPageInFlight.current === mediaPageKey
    ) return
    mediaPageInFlight.current = mediaPageKey
    void detail.fetchMore({
      variables: { id: selectedId, scope, mediaAfter: mediaCursor },
      updateQuery: (previous, { fetchMoreResult }) => {
        if (
          !previous.mediaGroup ||
          !fetchMoreResult?.mediaGroup ||
          previous.mediaGroup.id !== fetchMoreResult.mediaGroup.id
        )
          return previous
        const incoming = fetchMoreResult.mediaGroup.aggregateMedia
        const seen = new Set(
          previous.mediaGroup.aggregateMedia.edges.map((edge) => edge.cursor),
        )
        return {
          ...previous,
          mediaGroup: {
            ...fetchMoreResult.mediaGroup,
            aggregateMedia: {
              ...incoming,
              edges: [
                ...previous.mediaGroup.aggregateMedia.edges,
                ...incoming.edges.filter((edge) => !seen.has(edge.cursor)),
              ],
            },
          },
        }
      },
    })
    .catch(() => {
      // Avoid an automatic retry loop; allow a deliberate retry instead.
      setMediaPageFailedKey(mediaPageKey)
    })
    .finally(() => {
      if (mediaPageInFlight.current === mediaPageKey) {
        mediaPageInFlight.current = null
      }
    })
  }, [mediaPageKey, mediaCursor, selectedId, detail.loading,
      detail.fetchMore, mediaPageFailedKey])

  const [createGroup] = useCreateBrowserGroupMutation()
  const [updateGroup] = useUpdateBrowserGroupMutation()
  const [deleteGroup] = useDeleteBrowserGroupMutation()
  const [addToGroup] = useAddBrowserMediaToGroupMutation()
  const [removeFromGroup] = useRemoveBrowserMediaFromGroupMutation()

  const page = listing.data?.mediaGroups
  const nextCursor = page?.pageInfo.hasNextPage ? page.pageInfo.endCursor : null

  // The backend bounds individual pages; continue fetching until the scope's
  // complete group set is available for name-based relation selection.
  useEffect(() => {
    if (!nextCursor || listing.loading) return
    void listing.fetchMore({
      variables: { after: nextCursor },
      updateQuery: (previous, { fetchMoreResult }) => {
        const incoming = fetchMoreResult?.mediaGroups
        if (!incoming) return previous
        const seen = new Set(
          previous.mediaGroups.edges.map((edge) => edge.cursor),
        )
        return {
          ...previous,
          mediaGroups: {
            ...incoming,
            edges: [
              ...previous.mediaGroups.edges,
              ...incoming.edges.filter((edge) => !seen.has(edge.cursor)),
            ],
          },
        }
      },
    })
  }, [nextCursor, listing.loading, listing.fetchMore])

  const allGroups = useMemo<GroupBrowserGroup[]>(() => {
    const currentDetail = detail.data?.mediaGroup
    return (listing.data?.mediaGroups.edges ?? []).map(({ node }) => {
      const matching = currentDetail?.id === node.id ? currentDetail : null
      return {
        id: node.id,
        name: matching?.name ?? node.name,
        // Until Media thumbnails are available, preserve the existing
        // presentational contract without inventing Media counts.
        mediaCount: matching?.aggregateMedia.edges.length ?? 0,
        previewCount: matching?.aggregateMedia.edges.length ?? 0,
        parentNames:
          matching?.parents.edges.map(({ node: parent }) => parent.name) ?? [],
        childNames:
          matching?.children.edges.map(({ node: child }) => child.name) ?? [],
      }
    })
  }, [listing.data, detail.data])

  const relationAvailability = useMemo(() => {
    const result: Record<
      string,
      {
        parent: { canAdd: boolean; reason?: string }
        child: { canAdd: boolean; reason?: string }
      }
    > = {}
    for (const edge of candidateQuery.data?.mediaGroupRelationCandidates
      .edges ?? []) {
      const candidate = edge.node
      result[candidate.group.name] = {
        parent: {
          canAdd: candidate.addAsParent.canAdd,
          reason: candidate.addAsParent.unavailableReason ?? undefined,
        },
        child: {
          canAdd: candidate.addAsChild.canAdd,
          reason: candidate.addAsChild.unavailableReason ?? undefined,
        },
      }
    }
    return result
  }, [candidateQuery.data])

  const groupMemberships = useMemo<Record<string, string[]>>(
    () =>
      Object.fromEntries(
        (detail.data?.mediaGroup?.id === selectedId
          ? detail.data.mediaGroup.aggregateMedia.edges
          : []
        ).map(({ node }) => [
          node.id,
          node.groups.edges.map(({ node: group }) => group.name),
        ]),
      ),
    [detail.data, selectedId],
  )

  const mediaItemsData = useMemo(
    () =>
      detail.data?.mediaGroup?.id === selectedId
        ? detail.data.mediaGroup.aggregateMedia.edges.map(({ node }) => ({
            id: node.id,
            label: node.originalFileName,
            src: node.image?.variants[0]?.url ?? null,
          }))
        : [],
    [detail.data, selectedId],
  )

  const nameToId = useMemo(
    () => new Map(allGroups.map((group) => [group.name, group.id])),
    [allGroups],
  )
  const refetch = useCallback(async () => {
    await listing.refetch()
    if (selectedId)
      await Promise.all([detail.refetch(), candidateQuery.refetch()])
  }, [listing.refetch, detail.refetch, candidateQuery.refetch, selectedId])

  const onCreateGroup = useCallback(
    async (name: string, parents: string[], children: string[]) => {
      const ids = (names: string[]) => names.map((value) => {
        const groupId = nameToId.get(value)
        if (!groupId) throw new Error("Unknown relation candidate")
        return groupId
      })
      // The Group and all relations are created in one server transaction.
      // No follow-up Update mutation or automatic retry is allowed.
      let created
      try {
        created = await createGroup({
          variables: {
            input: {
              scope,
              name,
              parentGroupIds: ids(parents),
              childGroupIds: ids(children),
            },
          },
        })
      } catch (error) {
        if (isGroupUpdateOutcomeUnknown(error) || (error && typeof error === "object" && "graphQLErrors" in error && Array.isArray(error.graphQLErrors) && error.graphQLErrors.some((item: { extensions?: { code?: string } }) => item?.extensions?.code === "UNKNOWN_OUTCOME"))) {
          // The transaction may already have committed; never retry automatically.
          return "unknown" as const
        }
        throw error
      }
      if (!created.data?.createMediaGroup.group.id) {
        return "unknown" as const
      }
      // A refresh failure does not undo a confirmed successful creation.
      // Never tell users that the create failed once the server returned success.
      void refetch().catch(() => {
        showNotification({
          kind: "error",
          title: "Groupは作成されました",
          description: "一覧の更新に失敗しました。画面を再読み込みして確認してください。",
        })
      })
    },
    [scope, createGroup, nameToId, refetch],
  )

  const onUpdateGroup = useCallback(
    async (id: string, name: string, parents: string[], children: string[]) => {
      const old = allGroups.find((group) => group.id === id)
      if (!old) throw new Error("Group is no longer available")
      const currentDetail = detail.data?.mediaGroup
      if (!currentDetail || currentDetail.id !== id ||
          currentDetail.parents.pageInfo.hasNextPage ||
          currentDetail.children.pageInfo.hasNextPage) {
        throw new Error("Complete Group relation state is not loaded")
      }
      const resolveIds = (names: string[]) => names.map((value) => {
        const groupId = nameToId.get(value)
        if (!groupId) throw new Error("Unknown relation candidate")
        return groupId
      })
      try {
        const updated = await updateGroup({
          variables: { input: {
            groupId: id,
            expectedStateToken: currentDetail.stateToken,
            name,
            parentGroupIds: resolveIds(parents),
            childGroupIds: resolveIds(children),
          } },
        })
        if (!updated.data) {
          throw new Error("Group update result is unavailable")
        }
        await refetch()
      } catch (error) {
        if (isGroupStateConflict(error)) {
          // Keep the editor's draft intact. Refresh the persisted snapshot,
          // and require the user to review it before explicitly saving again.
          showNotification({
            kind: "error",
            title: "ほかの操作によってGroupが更新されました",
            description: "編集中の内容は保持されています。最新の関係を確認してから保存してください。",
          })
          await Promise.allSettled([detail.refetch(), candidateQuery.refetch(), listing.refetch()])
          return "conflict" as const
        }
        if (isGroupUpdateOutcomeUnknown(error)) {
          // A timeout may have committed. Do not issue another mutation.
          await Promise.allSettled([detail.refetch(), candidateQuery.refetch(), listing.refetch()])
          return "unknown" as const
        }
        throw error
      }
    },
    [allGroups, detail.data, detail.refetch, candidateQuery.refetch, listing.refetch, nameToId, updateGroup, refetch],
  )

  const onSaveMediaGroups = useCallback(
    async (mediaId: string, groupNames: string[]) => {
      const previous = groupMemberships[mediaId]
      if (!previous) throw new Error("Media memberships are not loaded")
      const add = groupNames.filter((name) => !previous.includes(name))
      const remove = previous.filter((name) => !groupNames.includes(name))
      const mutate = async (name: string, adding: boolean) => {
        const groupId = nameToId.get(name)
        if (!groupId) throw new Error("Group is no longer available in scope")
        const input = { groupId, mediaIds: [mediaId] }
        const result = adding
          ? (await addToGroup({ variables: { input } })).data?.addMediaToGroup
              .results
          : (await removeFromGroup({ variables: { input } })).data
              ?.removeMediaFromGroup.results
        if (!result || result.some((item) => item.status === "FAILED")) {
          throw new Error("Group classification failed")
        }
      }
      try {
        for (const name of remove) await mutate(name, false)
        for (const name of add) await mutate(name, true)
      } finally {
        // A partial success or ambiguous network result must be reconciled
        // against the API; never blindly retry the entire mutation sequence.
        await refetch()
      }
    },
    [groupMemberships, nameToId, addToGroup, removeFromGroup, refetch],
  )

  const onDeleteGroup = useCallback(
    async (id: string) => {
      await deleteGroupThenRefresh({
        deleteGroup: async () => {
          const result = await deleteGroup({
            variables: { input: { groupId: id } },
          })
          if (result.data?.deleteMediaGroup.groupId !== id) {
            throw new Error("Group deletion result could not be confirmed")
          }
        },
        onDeleted: () => setSelectedId(null),
        refreshGroups: () => listing.refetch(),
      })
    },
    [deleteGroup, listing.refetch],
  )

  if (listing.error)
    return (
      <Alert color="red" title="Group一覧を取得できませんでした">
        <Stack gap="xs" align="flex-start">
          <Text size="sm">Group一覧の取得に失敗しました。再試行できます。</Text>
          <Button
            size="xs"
            variant="light"
            disabled={listing.loading}
            loading={listing.loading}
            onClick={() => {
              void listing.refetch().catch(() => {
                // A failed retry stays in the discovery error state.
              })
            }}
          >
            再試行
          </Button>
        </Stack>
      </Alert>
    )
  if (
    (listing.loading && !listing.data) ||
    listing.data?.mediaGroups.pageInfo.hasNextPage
  ) {
    return (
      <Center mih={240}>
        <Loader />
      </Center>
    )
  }

  const candidateFailure = Boolean(selectedId && (
    candidateQuery.error || candidateLoadFailureId === selectedId
  ))
  const candidateLoading = Boolean(selectedId && (
    candidateRetryingId === selectedId ||
    candidateQuery.loading ||
    (!candidateQuery.data && !candidateFailure) ||
    candidateQuery.data?.mediaGroupRelationCandidates.pageInfo.hasNextPage
  ))

  return (
    <GroupBrowser
      relationCandidateState={
        candidateRetryingId === selectedId ? "loading" :
        candidateFailure ? "error" :
        candidateLoading ? "loading" : "ready"
      }
      onRetryRelationCandidates={retryRelationCandidates}
      contextKind={contextKind}
      communityId={communityId}
      groupsData={allGroups}
      mediaItemsData={mediaItemsData}
      relationCandidates={allGroups.map((group) => group.name)}
      relationAvailability={relationAvailability}
      groupMemberships={groupMemberships}
      onSaveMediaGroups={onSaveMediaGroups}
      onSelectGroup={setSelectedId}
      onRetryGroupMedia={async () => {
        if (!selectedId || detail.loading) return
        try {
          await detail.refetch()
          setMediaPageFailedKey(null)
        } catch {
          // Query error remains visible; retry does not alter the selected Group.
        }
      }}
      mediaPageState={
        !mediaPageKey || !detail.data?.mediaGroup?.aggregateMedia.edges.length
          ? "idle"
          : mediaPageFailedKey === mediaPageKey
            ? "error"
            : "loading"
      }
      onRetryMediaPage={retryMediaPage}
      mediaDetailState={
        !selectedId ? "ready" :
        detail.data?.mediaGroup?.id !== selectedId ? "loading" :
        detail.data.mediaGroup.aggregateMedia.edges.length > 0 ? "ready" :
        mediaPageFailedKey === mediaPageKey || detail.error ? "error" :
        detail.loading || detail.data.mediaGroup.aggregateMedia.pageInfo.hasNextPage
          ? "loading" : "ready"
      }
      detailsReady={
        !selectedId ||
        (!detail.loading &&
          !detail.error &&
          !candidateQuery.error &&
          Boolean(candidateQuery.data) &&
          candidateLoadFailureId !== selectedId &&
          candidateRetryingId !== selectedId &&
          !candidateQuery.loading &&
          !candidateQuery.data?.mediaGroupRelationCandidates.pageInfo
            .hasNextPage &&
          detail.data?.mediaGroup?.id === selectedId &&
          !detail.data.mediaGroup.parents.pageInfo.hasNextPage &&
          !detail.data.mediaGroup.children.pageInfo.hasNextPage)
      }
      hideManagementActions={
        contextKind === "community" &&
        Boolean(communityMembers.data && currentUser.data?.me) &&
        !canManage
      }
      canManage={canManage}
      onCreateGroup={onCreateGroup}
      onUpdateGroup={onUpdateGroup}
      onDeleteGroup={onDeleteGroup}
    />
  )
}
