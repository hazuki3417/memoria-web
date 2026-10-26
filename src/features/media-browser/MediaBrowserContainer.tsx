"use client"

import { gql, useQuery } from "@apollo/client"
import { useCallback, useState } from "react"
import { MediaBrowser } from "./MediaBrowser"
import { selectBrowserThumbnail } from "./selectBrowserThumbnail"
import type { MediaItem } from "@/features/media-detail"

// Keep the query local until the generated operation is added to GraphQL codegen.
const MEDIA_LIST = gql`
  query MediaBrowserList($scope: ScopeInput!, $first: Int!, $after: String) {
    mediaList(scope: $scope, first: $first, after: $after) {
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

type ListResult = {
  mediaList: {
    edges: { cursor: string; node: {
      id: string
      originalFileName: string
      processing: { status: string } | null
      image: { variants: { url: string; width: number }[] } | null
    } }[]
    pageInfo: { hasNextPage: boolean; endCursor: string | null }
  }
}

export function MediaBrowserContainer({ contextKind = "personal", communityId }: {
  contextKind?: "personal" | "community"
  communityId?: string
}) {
  const scope = contextKind === "personal"
    ? { type: "PERSONAL" }
    : { type: "COMMUNITY", communityId }
  const query = useQuery<ListResult>(MEDIA_LIST, {
    variables: { scope, first: 50 },
    skip: contextKind === "community" && !communityId,
    notifyOnNetworkStatusChange: true,
  })
  const [pageError, setPageError] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  // Do not use previousData: it may belong to a different Personal / Community scope.
  const snapshot = query.data
  const edges = snapshot?.mediaList.edges ?? []
  // Choose a suitable published variant by width, never by array position.
  const items: MediaItem[] = edges.map(({ node }) => ({
    id: node.id,
    label: node.originalFileName,
    src: selectBrowserThumbnail(node.image?.variants ?? []),
    variants: node.image?.variants ?? [],
    failed: node.processing?.status === "FAILED",
    processing: node.processing?.status === "PROCESSING",
  }))
  const pageInfo = snapshot?.mediaList.pageInfo

  const loadMore = useCallback(async () => {
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor || loadingMore) return
    setLoadingMore(true)
    setPageError(false)
    try {
      await query.fetchMore({
        variables: { after: pageInfo.endCursor },
        updateQuery(previous, { fetchMoreResult }) {
          if (!fetchMoreResult) return previous
          const seen = new Set(previous.mediaList.edges.map(edge => edge.node.id))
          return { mediaList: {
            ...fetchMoreResult.mediaList,
            edges: [...previous.mediaList.edges,
              ...fetchMoreResult.mediaList.edges.filter(edge => !seen.has(edge.node.id))],
          } }
        },
      })
    } catch {
      setPageError(true)
    } finally {
      setLoadingMore(false)
    }
  }, [pageInfo?.hasNextPage, pageInfo?.endCursor, loadingMore, query.fetchMore])

  return <MediaBrowser
    contextKind={contextKind}
    communityId={communityId}
    items={items}
    listState={query.error ? "error" : query.loading && !snapshot ? "loading"
      : items.length === 0 ? "true-empty" : "default"}
    onRetry={() => void query.refetch()}
    onLoadMore={() => void loadMore()}
    hasMore={Boolean(pageInfo?.hasNextPage)}
    loadingMore={loadingMore}
    loadMoreError={pageError}
  />
}
