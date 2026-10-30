"use client"

import { useEffect, useMemo, useRef } from "react"
import {
  ScopeType,
  useDashboardRecentMediaQuery,
  useDashboardRecentGroupsQuery,
} from "@/infrastructure/graphql/generated"
import { Dashboard, type DashboardGroup } from "./Dashboard"
import { useMediaDetailUrl } from "@/features/media-detail/MediaDetailUrlProvider"
import { selectDashboardThumbnail } from "./selectDashboardThumbnail"

// Remount the entire scoped query consumer when switching contexts. Apollo
// must not expose the previous Community's protected data while loading.
export function DashboardContainer({
  contextKind = "personal",
  communityId,
}: {
  contextKind?: "personal" | "community"
  communityId?: string
}) {
  return (
    <ScopedDashboard
      key={
        contextKind === "personal"
          ? "personal"
          : `community:${communityId ?? ""}`
      }
      contextKind={contextKind}
      communityId={communityId}
    />
  )
}

function ScopedDashboard({
  contextKind,
  communityId,
}: {
  contextKind: "personal" | "community"
  communityId?: string
}) {
  const { openMediaDetail } = useMediaDetailUrl()
  const scope = useMemo(
    () =>
      contextKind === "community"
        ? { type: ScopeType.Community, communityId }
        : { type: ScopeType.Personal },
    [contextKind, communityId],
  )
  const skip = contextKind === "community" && !communityId
  const media = useDashboardRecentMediaQuery({
    variables: { scope },
    skip,
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  })
  const groups = useDashboardRecentGroupsQuery({
    variables: { scope },
    skip,
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  })

  // Media image URLs are signed for 15 minutes. Refresh before expiry and
  // when a sleeping tab returns, without persisting signed URLs separately.
  const lastRefresh = useRef(Date.now())
  useEffect(() => {
    if (skip) return
    lastRefresh.current = Date.now()
    const refresh = () => {
      lastRefresh.current = Date.now()
      void Promise.allSettled([media.refetch(), groups.refetch()])
    }
    const interval = window.setInterval(refresh, 12 * 60 * 1000)
    const onVisible = () => {
      if (
        document.visibilityState === "visible" &&
        Date.now() - lastRefresh.current >= 12 * 60 * 1000
      )
        refresh()
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [skip, media.refetch, groups.refetch])

  const mediaNodes = media.data?.mediaList.edges.map((edge) => edge.node) ?? []
  const groupItems: DashboardGroup[] = (
    groups.data?.mediaGroups.edges ?? []
  ).map(({ node }) => ({
    id: node.id,
    name: node.name,
    // Distinguish exactly four Media from a Group with more than four.
    mediaCount:
      node.media.edges.length + (node.media.pageInfo.hasNextPage ? 1 : 0),
    media: node.media.edges.map((edge) =>
      selectDashboardThumbnail(edge.node.image?.variants),
    ),
  }))
  const mediaState =
    skip || media.error ? "error" : !media.data ? "loading" : "ready"
  const groupState =
    skip || groups.error ? "error" : !groups.data ? "loading" : "ready"

  return (
    <Dashboard
      contextKind={contextKind}
      communityId={communityId}
      mediaIds={mediaNodes.slice(0, 32).map((node) => node.id)}
      onOpenMedia={(mediaId) => {
        if (!skip) openMediaDetail({ mediaId, orderedLoadedMediaIds: mediaNodes.slice(0, 32).map((node) => node.id) })
      }}
      mediaItems={mediaNodes.map((node) =>
        selectDashboardThumbnail(node.image?.variants),
      )}
      mediaState={mediaState}
      groupState={groupState}
      groupItems={groupItems}
      onRetryMedia={() => void media.refetch()}
      onRetryGroups={() => void groups.refetch()}
    />
  )
}
