"use client"

import { BulkItemStatus, ScopeType, useAddBrowserMediaToGroupMutation, useBrowseGroupsQuery, useMediaBrowserListQuery, useMediaBrowserTagsQuery } from "@/infrastructure/graphql/generated"
import { Alert, Button, Group, Text } from "@mantine/core"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { MediaBrowser } from "./MediaBrowser"
import { selectBrowserThumbnail } from "./selectBrowserThumbnail"
import { resolveTagFilter } from "./resolveTagFilter"
import type { MediaItem } from "@/features/media-detail"
import { showNotification } from "@/components/Feedback"

export function MediaBrowserContainer({ contextKind = "personal", communityId }: {
  contextKind?: "personal" | "community"
  communityId?: string
}) {
  const scope = useMemo(() => contextKind === "personal"
    ? { type: ScopeType.Personal }
    : { type: ScopeType.Community, communityId }, [contextKind, communityId])
  const skip = contextKind === "community" && !communityId
  const scopeKey = contextKind + ":" + (communityId ?? "")

  // The applied filter belongs to one scope. Reset it on scope change.
  const [appliedFilter, setAppliedFilter] = useState<{ scopeKey: string; tagIds: string[] }>({
    scopeKey, tagIds: [],
  })
  const selectedTagIds = appliedFilter.scopeKey === scopeKey ? appliedFilter.tagIds : []
  const [tagError, setTagError] = useState<{ scopeKey: string; message: string } | null>(null)

  const tagQuery = useMediaBrowserTagsQuery({
    variables: { scope, first: 100 },
    skip,
    notifyOnNetworkStatusChange: true,
  })
  const tagsPage = tagQuery.data?.mediaTags
  const nextTagsCursor = tagsPage?.pageInfo.hasNextPage ? tagsPage.pageInfo.endCursor : null
  const tagPageInFlight = useRef<string | null>(null)
  const tagPageFailures = useRef<Set<string>>(new Set())
  const [tagPageFailedKey, setTagPageFailedKey] = useState<string | null>(null)

  // Tag names are the display contract; only persisted IDs reach mediaList.
  // Exhaust the bounded Tag connection so Search can resolve all scoped names.
  useEffect(() => {
    if (!nextTagsCursor || tagQuery.loading || tagQuery.error || skip) return
    const key = scopeKey + ":" + nextTagsCursor
    if (tagPageInFlight.current === key || tagPageFailures.current.has(key)) return
    tagPageInFlight.current = key
    void tagQuery.fetchMore({
      variables: { after: nextTagsCursor },
      updateQuery(previous, { fetchMoreResult }) {
        if (!fetchMoreResult) return previous
        const seen = new Set(previous.mediaTags.edges.map(edge => edge.node.id))
        return { mediaTags: {
          ...fetchMoreResult.mediaTags,
          edges: [
            ...previous.mediaTags.edges,
            ...fetchMoreResult.mediaTags.edges.filter(edge => !seen.has(edge.node.id)),
          ],
        } }
      },
    }).catch(() => {
      tagPageFailures.current.add(key)
      setTagPageFailedKey(key)
    }).finally(() => {
      if (tagPageInFlight.current === key) tagPageInFlight.current = null
    })
  }, [nextTagsCursor, scopeKey, tagQuery.loading, tagQuery.error, tagQuery.fetchMore, skip, tagPageFailedKey])

  const retryTags = useCallback(() => {
    tagPageFailures.current.clear()
    setTagPageFailedKey(null)
    if (tagQuery.error) void tagQuery.refetch()
  }, [tagQuery.error, tagQuery.refetch])

  const allTagsLoaded = !tagQuery.loading && !tagQuery.error &&
    Boolean(tagsPage && !tagsPage.pageInfo.hasNextPage)
  const tagsByName = useMemo(() => new Map((tagsPage?.edges ?? [])
    .map(({ node }) => [node.name, node.id] as const)), [tagsPage])
  const applyTags = useCallback((names: string[]) => {
    if (names.length > 0 && !allTagsLoaded) {
      setTagError({ scopeKey, message: "Tagの取得が完了していません。再度お試しください。" })
      return
    }
    const resolution = resolveTagFilter(names, (tagsPage?.edges ?? []).map(edge => edge.node))
    if (!resolution.ok) {
      setTagError({ scopeKey, message: "現在の範囲に存在するTagを重複なく選択してください。" })
      return
    }
    setTagError(null)
    setAppliedFilter({ scopeKey, tagIds: resolution.tagIds })
  }, [scopeKey, allTagsLoaded, tagsPage])

  const query = useMediaBrowserListQuery({
    variables: { scope, filter: { tagIds: selectedTagIds }, first: 50 },
    // Signed Variant URLs are valid for 15 minutes. Never trust an old
    // cached connection when the user revisits this screen.
    fetchPolicy: "network-only",
    skip,
    notifyOnNetworkStatusChange: true,
  })
  const groupQuery = useBrowseGroupsQuery({
    variables: { scope, first: 100 },
    skip,
    notifyOnNetworkStatusChange: true,
  })
  const [addToGroupMutation] = useAddBrowserMediaToGroupMutation()
  const [groupActionPending, setGroupActionPending] = useState(false)
  const [groupActionError, setGroupActionError] = useState<string | null>(null)
  const groupsPage = groupQuery.data?.mediaGroups
  const groupOptions = (groupsPage?.edges ?? []).map(({ node }) => ({
    value: node.id, label: node.name,
  }))
  const addToGroups = useCallback(async (mediaIds: string[], groupIds: string[]): Promise<boolean> => {
    if (groupActionPending || !mediaIds.length || !groupIds.length || !groupsPage ||
        groupsPage.pageInfo.hasNextPage || groupQuery.error) return false
    const available = new Set(groupsPage.edges.map(({ node }) => node.id))
    if (!groupIds.every(id => available.has(id))) {
      setGroupActionError("現在の範囲に存在するGroupを選択してください。")
      return false
    }
    setGroupActionPending(true)
    setGroupActionError(null)
    try {
      const results = await Promise.all(groupIds.map(groupId =>
        addToGroupMutation({ variables: { input: { groupId, mediaIds } } })
      ))
      const failures = results.flatMap(result =>
        (result.data?.addMediaToGroup.results ?? []).filter(item => item.status === BulkItemStatus.Failed))
      if (failures.length || results.some(result => !result.data)) {
        setGroupActionError("一部のMediaをGroupへ追加できませんでした。結果を確認して再試行してください。")
        return false
      }
      showNotification({
        kind: "success",
        title: "Groupへの追加",
        description: `${mediaIds.length}件のMediaを${groupIds.length}件のGroupへ追加しました。`,
      })
      return true
    } catch {
      setGroupActionError("Groupへの追加結果を確認できませんでした。再試行前に状態を確認してください。")
      return false
    } finally {
      setGroupActionPending(false)
    }
  }, [groupActionPending, groupsPage, groupQuery.error, addToGroupMutation])

  // Group results can span multiple pages. Only offer a complete list.
  const groupCursor = groupsPage?.pageInfo.hasNextPage ? groupsPage.pageInfo.endCursor : null
  const groupPageInFlight = useRef<string | null>(null)
  const [groupPageFailure, setGroupPageFailure] = useState<string | null>(null)
  useEffect(() => {
    if (!groupCursor || skip || groupQuery.loading || groupQuery.error ||
        groupPageFailure === scopeKey) return
    const key = scopeKey + ":" + groupCursor
    if (groupPageInFlight.current === key) return
    groupPageInFlight.current = key
    void groupQuery.fetchMore({
      variables: { after: groupCursor },
      updateQuery(previous, { fetchMoreResult }) {
        if (!fetchMoreResult) return previous
        const seen = new Set(previous.mediaGroups.edges.map(edge => edge.node.id))
        return { mediaGroups: {
          ...fetchMoreResult.mediaGroups,
          edges: [...previous.mediaGroups.edges,
            ...fetchMoreResult.mediaGroups.edges.filter(edge => !seen.has(edge.node.id))],
        } }
      },
    }).catch(() => setGroupPageFailure(scopeKey))
      .finally(() => { if (groupPageInFlight.current === key) groupPageInFlight.current = null })
  }, [groupCursor, scopeKey, skip, groupQuery.loading, groupQuery.error, groupQuery.fetchMore, groupPageFailure])

  const [pageFailure, setPageFailure] = useState<string | null>(null)
  const [pageLoading, setPageLoading] = useState<string | null>(null)
  const pageInFlight = useRef<string | null>(null)
  // Do not reuse previousData across scope or Tag-filter changes.
  const page = query.data?.mediaList
  const items: MediaItem[] = (page?.edges ?? []).map(({ node }) => ({
    id: node.id,
    label: node.originalFileName,
    src: selectBrowserThumbnail(node.image?.variants ?? []),
    variants: node.image?.variants ?? [],
    failed: node.processing?.status === "FAILED",
    processing: node.processing?.status === "PROCESSING",
  }))
  const nextCursor = page?.pageInfo.hasNextPage ? page.pageInfo.endCursor : null
  const requestKey = scopeKey + ":" + selectedTagIds.join(",") + ":" + (nextCursor ?? "")
  const loadMore = useCallback(async () => {
    if (!nextCursor || query.loading || pageInFlight.current === requestKey) return
    pageInFlight.current = requestKey
    setPageFailure(null)
    setPageLoading(requestKey)
    try {
      await query.fetchMore({
        variables: { after: nextCursor },
        updateQuery(previous, { fetchMoreResult }) {
          if (!fetchMoreResult) return previous
          const seen = new Set(previous.mediaList.edges.map(edge => edge.node.id))
          return { mediaList: {
            ...fetchMoreResult.mediaList,
            edges: [
              ...previous.mediaList.edges,
              ...fetchMoreResult.mediaList.edges.filter(edge => !seen.has(edge.node.id)),
            ],
          } }
        },
      })
    } catch {
      setPageFailure(requestKey)
    } finally {
      if (pageInFlight.current === requestKey) pageInFlight.current = null
      setPageLoading(current => current === requestKey ? null : current)
    }
  }, [nextCursor, query.loading, query.fetchMore, requestKey])

  return <>
    {tagError?.scopeKey === scopeKey && <Alert color="red" title="Tag検索" role="alert">{tagError.message}</Alert>}
    {(tagQuery.error || (tagPageFailedKey && tagPageFailedKey.startsWith(scopeKey + ":"))) && (
      <Alert color="red" title="Tagを読み込めませんでした" role="alert">
        <Group justify="space-between">
          <Text size="sm">通信状態を確認して再度お試しください。</Text>
          <Button size="xs" variant="default" onClick={retryTags}>再試行</Button>
        </Group>
      </Alert>
    )}
    <MediaBrowser
      key={scopeKey}
      contextKind={contextKind}
      communityId={communityId}
      items={items}
      filterResetKey={scopeKey + ":" + selectedTagIds.join(",")}
      groupOptions={groupQuery.loading || groupQuery.error || groupsPage?.pageInfo.hasNextPage || groupPageFailure === scopeKey ? [] : groupOptions}
      onAddToGroups={addToGroups}
      groupActionPending={groupActionPending}
      groupActionError={groupActionError ?? (groupQuery.error || groupPageFailure === scopeKey
        ? "Groupを取得できませんでした。"
        : groupsPage?.pageInfo.hasNextPage || groupQuery.loading ? "Groupを読み込み中です。" : null)}
      tagOptions={allTagsLoaded ? [...tagsByName.keys()] : []}
      onApplyTags={applyTags}
      listState={query.error ? "error" : query.loading && !page ? "loading"
        : items.length === 0 ? (selectedTagIds.length > 0 ? "filtered-empty" : "true-empty") : "default"}
      onRetry={() => void query.refetch()}
      onLoadMore={() => void loadMore()}
      hasMore={Boolean(nextCursor)}
      loadingMore={pageLoading === requestKey}
      loadMoreError={pageFailure === requestKey}
    />
  </>
}
