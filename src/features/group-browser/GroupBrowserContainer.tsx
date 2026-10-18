"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  MediaGroupRelationChangeAction,
  MediaGroupRelationDirection,
  MediaGroupSort,
  ScopeType,
  useBrowseGroupsQuery,
  useBrowseGroupDetailQuery,
  useCreateBrowserGroupMutation,
  useUpdateBrowserGroupMutation,
  useDeleteBrowserGroupMutation,
} from "@/infrastructure/graphql/generated"
import { GroupBrowser, type GroupBrowserGroup } from "./GroupBrowser"

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
  const listing = useBrowseGroupsQuery({
    variables: { scope, sort: MediaGroupSort.NameAsc, first: 100 },
    skip: contextKind === "community" && !communityId,
  })
  const detail = useBrowseGroupDetailQuery({
    variables: { id: selectedId ?? "" },
    skip: !selectedId,
  })
  const [createGroup] = useCreateBrowserGroupMutation()
  const [updateGroup] = useUpdateBrowserGroupMutation()
  const [deleteGroup] = useDeleteBrowserGroupMutation()

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
        const seen = new Set(previous.mediaGroups.edges.map((edge) => edge.cursor))
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
        previewCount: 0,
        parentNames: matching?.parents.edges.map(({ node: parent }) => parent.name) ?? [],
        childNames: matching?.children.edges.map(({ node: child }) => child.name) ?? [],
      }
    })
  }, [listing.data, detail.data])

  const nameToId = useMemo(
    () => new Map(allGroups.map((group) => [group.name, group.id])),
    [allGroups],
  )
  const refetch = useCallback(async () => {
    await listing.refetch()
    if (selectedId) await detail.refetch()
  }, [listing.refetch, detail.refetch, selectedId])

  const changes = useCallback(
    (parents: string[], children: string[], previousParents: string[], previousChildren: string[]) => {
      const result: Array<{
        groupId: string
        direction: MediaGroupRelationDirection
        action: MediaGroupRelationChangeAction
      }> = []
      for (const [direction, desired, previous] of [
        [MediaGroupRelationDirection.Parent, parents, previousParents],
        [MediaGroupRelationDirection.Child, children, previousChildren],
      ] as const) {
        for (const name of desired.filter((item) => !previous.includes(item))) {
          const groupId = nameToId.get(name)
          if (!groupId) throw new Error("Relation candidate is not in the current scope")
          result.push({ groupId, direction, action: MediaGroupRelationChangeAction.Add })
        }
        for (const name of previous.filter((item) => !desired.includes(item))) {
          const groupId = nameToId.get(name)
          if (!groupId) throw new Error("Existing relation group is unavailable")
          result.push({ groupId, direction, action: MediaGroupRelationChangeAction.Remove })
        }
      }
      return result
    },
    [nameToId],
  )

  const onCreateGroup = useCallback(async (name: string, parents: string[], children: string[]) => {
    const created = await createGroup({ variables: { input: { scope, name } } })
    const id = created.data?.createMediaGroup.group.id
    if (!id) throw new Error("Group creation returned no ID")
    if (parents.length || children.length) {
      const relationChanges = changes(parents, children, [], [])
      const result = await updateGroup({
        variables: { input: { groupId: id, relationChanges } },
      })
      if (result.data?.updateMediaGroup.relationResults.some((item) => item.status === "FAILED")) {
        await refetch()
        throw new Error("Some Group relations could not be created")
      }
    }
    await refetch()
  }, [scope, createGroup, updateGroup, changes, refetch])

  const onUpdateGroup = useCallback(async (
    id: string, name: string, parents: string[], children: string[],
  ) => {
    const old = allGroups.find((group) => group.id === id)
    if (!old) throw new Error("Group is no longer available")
    const relationChanges = changes(parents, children, old.parentNames, old.childNames)
    const updated = await updateGroup({
      variables: { input: { groupId: id, name, relationChanges } },
    })
    if (!updated.data || updated.data.updateMediaGroup.relationResults.some((item) => item.status === "FAILED")) {
      await refetch()
      throw new Error("Some Group changes could not be applied")
    }
    await refetch()
  }, [allGroups, changes, updateGroup, refetch])

  const onDeleteGroup = useCallback(async (id: string) => {
    await deleteGroup({ variables: { input: { groupId: id } } })
    setSelectedId(null)
    await listing.refetch()
  }, [deleteGroup, listing.refetch])

  return (
    <GroupBrowser
      contextKind={contextKind}
      communityId={communityId}
      groupsData={allGroups}
      relationCandidates={allGroups.map((group) => group.name)}
      onSelectGroup={setSelectedId}
      onCreateGroup={onCreateGroup}
      onUpdateGroup={onUpdateGroup}
      onDeleteGroup={onDeleteGroup}
    />
  )
}
