"use client"

import { gql, useQuery } from "@apollo/client"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { MediaBrowser } from "./MediaBrowser"
import { selectBrowserThumbnail } from "./selectBrowserThumbnail"
import { resolveTagFilter } from "./resolveTagFilter"
import type { MediaItem } from "@/features/media-detail"

// API-side scope is authoritative; the Web never sends user IDs for Personal.
const MEDIA_LIST = gql`
  query MediaBrowserList($scope: ScopeInput!, $filter: MediaFilterInput, $first: Int!, $after: String) {
    mediaList(scope: $scope, filter: $filter, first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          originalFileName
          processing { status }
          image { variants { url width } }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`
const MEDIA_TAGS = gql`
  query MediaBrowserTags($scope: ScopeInput!, $first: Int!, $after: String) {
    mediaTags(scope: $scope, first: $first, after: $after) {
      edges { cursor node { id name } }
      pageInfo { hasNextPage endCursor }
    }
  }
`

type PageInfo = { hasNextPage: boolean; endCursor: string | null }
type ListResult = {
  mediaList: {
    edges: { cursor: string; node: {
      id: string
      originalFileName: string
      processing: { status: string } | null
      image: { variants: { url: string; width: number }[] } | null
    } }[]
    pageInfo: PageInfo
  }
}
type TagsResult = {
  mediaTags: {
    edges: { cursor: string; node: { id: string; name: string } }[]
    pageInfo: PageInfo
  }
}

export function MediaBrowserContainer({ contextKind = "personal", communityId }: {
  contextKind?: "personal" | "community"
  communityId?: string
}) {
  const scope = useMemo(() => contextKind === "personal"
    ? { type: "PERSONAL" }
    : { type: "COMMUNITY", communityId }, [contextKind, communityId])
  const skip = contextKind === "community" && !communityId
  const scopeKey = contextKind + ":" + (communityId ?? "")

  // The applied filter belongs to one scope. Reset it on scope change.
  const [appliedFilter, setAppliedFilter] = useState<{ scopeKey: string; tagIds: string[] }>({
    scopeKey, tagIds: [],
  })
  const selectedTagIds = appliedFilter.scopeKey === scopeKey ? appliedFilter.tagIds : []
  const [tagError, setTagError] = useState<string | null>(null)

  const tagQuery = useQuery<TagsResult>(MEDIA_TAGS, {
    variables: { scope, first: 100 },
    skip,
    notifyOnNetworkStatusChange: true,
  })
  const tagsPage = tagQuery.data?.mediaTags
  const nextTagsCursor = tagsPage?.pageInfo.hasNextPage ? tagsPage.pageInfo.endCursor : null
  const tagPageInFlight = useRef<string | null>(null)
  const tagPageFailures = useRef<Set<string>>(new Set())

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
    }).finally(() => {
      if (tagPageInFlight.current === key) tagPageInFlight.current = null
    })
  }, [nextTagsCursor, scopeKey, tagQuery.loading, tagQuery.error, tagQuery.fetchMore, skip])

  const allTagsLoaded = !tagQuery.loading && !tagQuery.error &&
    Boolean(tagsPage && !tagsPage.pageInfo.hasNextPage)
  const tagsByName = useMemo(() => new Map((tagsPage?.edges ?? [])
    .map(({ node }) => [node.name, node.id] as const)), [tagsPage])
  const applyTags = useCallback((names: string[]) => {
    if (names.length > 0 && !allTagsLoaded) {
      setTagError("Tagの取得が完了していません。再度お試しください。")
      return
    }
    const resolution = resolveTagFilter(names, (tagsPage?.edges ?? []).map(edge => edge.node))
    if (!resolution.ok) {
      setTagError("現在の範囲に存在するTagを重複なく選択してください。")
      return
    }
    setTagError(null)
    setAppliedFilter({ scopeKey, tagIds: resolution.tagIds })
  }, [scopeKey, allTagsLoaded, tagsPage])

  const query = useQuery<ListResult>(MEDIA_LIST, {
    variables: { scope, filter: { tagIds: selectedTagIds }, first: 50 },
    skip,
    notifyOnNetworkStatusChange: true,
  })
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
    {tagError && <div role="alert">{tagError}</div>}
    <MediaBrowser
      key={scopeKey}
      contextKind={contextKind}
      communityId={communityId}
      items={items}
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
