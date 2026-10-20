"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Alert, Center, Loader } from "@mantine/core"
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
import { groupRelationChanges } from "./groupRelationChanges"
import { deleteGroupThenRefresh } from "./groupDeleteFlow"
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
  const candidateCursor = candidateQuery.data?.mediaGroupRelationCandidates
    .pageInfo.hasNextPage
    ? candidateQuery.data.mediaGroupRelationCandidates.pageInfo.endCursor
    : null
  useEffect(() => {
    if (!candidateCursor || candidateQuery.loading) return
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
  }, [candidateCursor, candidateQuery.loading, candidateQuery.fetchMore])

  const mediaCursor =
    detail.data?.mediaGroup?.id === selectedId &&
    detail.data.mediaGroup.aggregateMedia.pageInfo.hasNextPage
      ? detail.data.mediaGroup.aggregateMedia.pageInfo.endCursor
      : null
  useEffect(() => {
    if (!mediaCursor || !selectedId || detail.loading) return
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
  }, [mediaCursor, selectedId, detail.loading, detail.fetchMore])

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
        name: node.name,
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
      const created = await createGroup({
        variables: { input: { scope, name } },
      })
      const id = created.data?.createMediaGroup.group.id
      if (!id) throw new Error("Group creation returned no ID")
      if (parents.length || children.length) {
        try {
          const relationChanges = groupRelationChanges(
            { parents, children },
            { parents: [], children: [] },
            nameToId,
          )
          const result = await updateGroup({
            variables: { input: { groupId: id, relationChanges } },
          })
          if (
            !result.data ||
            result.data.updateMediaGroup.relationResults.some(
              (item) => item.status === "FAILED",
            )
          ) {
            showNotification({
              kind: "error",
              title:
                "Groupは作成されましたが、一部の関係を設定できませんでした",
              description:
                "Group自体は保存されています。関係の最新状態を確認してください。",
            })
          }
        } catch {
          showNotification({
            kind: "error",
            title:
              "Groupは作成されましたが、関係の設定結果を確認できませんでした",
            description: "Groupを再作成せず、最新の関係を確認してください。",
          })
        }
      }
      await refetch()
    },
    [scope, createGroup, updateGroup, nameToId, refetch],
  )

  const onUpdateGroup = useCallback(
    async (id: string, name: string, parents: string[], children: string[]) => {
      const old = allGroups.find((group) => group.id === id)
      if (!old) throw new Error("Group is no longer available")
      const relationChanges = groupRelationChanges(
        { parents, children },
        { parents: old.parentNames, children: old.childNames },
        nameToId,
      )
      const updated = await updateGroup({
        variables: { input: { groupId: id, name, relationChanges } },
      })
      if (
        !updated.data ||
        updated.data.updateMediaGroup.relationResults.some(
          (item) => item.status === "FAILED",
        )
      ) {
        await refetch()
        throw new Error("Some Group changes could not be applied")
      }
      await refetch()
    },
    [allGroups, nameToId, updateGroup, refetch],
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
        再読み込みしてお試しください。
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

  return (
    <GroupBrowser
      contextKind={contextKind}
      communityId={communityId}
      groupsData={allGroups}
      mediaItemsData={mediaItemsData}
      relationCandidates={allGroups.map((group) => group.name)}
      relationAvailability={relationAvailability}
      groupMemberships={groupMemberships}
      onSaveMediaGroups={onSaveMediaGroups}
      onSelectGroup={setSelectedId}
      detailsReady={
        !selectedId ||
        (!detail.loading &&
          !detail.error &&
          !candidateQuery.error &&
          !candidateQuery.loading &&
          !candidateQuery.data?.mediaGroupRelationCandidates.pageInfo
            .hasNextPage &&
          detail.data?.mediaGroup?.id === selectedId)
      }
      canManage={canManage}
      onCreateGroup={onCreateGroup}
      onUpdateGroup={onUpdateGroup}
      onDeleteGroup={onDeleteGroup}
    />
  )
}
