"use client"

import { gql, useQuery } from "@apollo/client"
import { useEffect, useMemo, useRef } from "react"
import { ScopeType } from "@/infrastructure/graphql/generated"
import { Dashboard } from "./Dashboard"
import type { DashboardGroup } from "./Dashboard"

type Scope = { type: ScopeType; communityId?: string }
type PreviewMedia = { id: string; image: { variants: Array<{ url: string; width: number }> } | null }
type MediaResponse = {
  mediaList: { edges: Array<{ node: PreviewMedia }> }
}
type GroupsResponse = {
  mediaGroups: { edges: Array<{ node: {
    id: string
    name: string
    media: { edges: Array<{ node: PreviewMedia }> }
  } }> }
}

const DASHBOARD_MEDIA = gql`
  query DashboardRecentMedia($scope: ScopeInput!) {
    mediaList(scope: $scope, first: 32) {
      edges { node { id image { variants { url width } } } }
    }
  }
`

const DASHBOARD_GROUPS = gql`
  query DashboardRecentGroups($scope: ScopeInput!) {
    mediaGroups(scope: $scope, sort: CREATED_AT_DESC, first: 6) {
      edges {
        node {
          id
          name
          media(first: 4) {
            edges { node { id image { variants { url width } } } }
          }
        }
      }
    }
  }
`

function thumbnail(variants: Array<{ url: string; width: number }> = []): string {
  const sorted = variants.filter((item) => item.url).sort((a, b) => a.width - b.width)
  return sorted.find((item) => item.width >= 320)?.url ?? sorted.at(-1)?.url ?? ""
}

export function DashboardContainer({ contextKind = "personal", communityId }: {
  contextKind?: "personal" | "community"
  communityId?: string
}) {
  const scope = useMemo<Scope>(
    () => contextKind === "community"
      ? { type: ScopeType.Community, communityId }
      : { type: ScopeType.Personal },
    [contextKind, communityId],
  )
  const skip = contextKind === "community" && !communityId
  const media = useQuery<MediaResponse>(DASHBOARD_MEDIA, {
    variables: { scope },
    skip,
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  })
  const groups = useQuery<GroupsResponse>(DASHBOARD_GROUPS, {
    variables: { scope },
    skip,
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  })
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
      if (document.visibilityState === "visible" &&
        Date.now() - lastRefresh.current >= 12 * 60 * 1000) refresh()
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [skip, media.refetch, groups.refetch, contextKind, communityId])

  const mediaNodes = media.data?.mediaList.edges.map(edge => edge.node) ?? []
  const groupItems: DashboardGroup[] = (groups.data?.mediaGroups.edges ?? []).map(({ node }) => ({
    id: node.id,
    name: node.name,
    mediaCount: node.media.edges.length,
    media: node.media.edges.map(edge => thumbnail(edge.node.image?.variants)),
  }))
  const mediaState = skip || media.error ? "error" : !media.data ? "loading" : "ready"
  const groupState = skip || groups.error ? "error" : !groups.data ? "loading" : "ready"
  return <Dashboard
    contextKind={contextKind}
    communityId={communityId}
    mediaItems={mediaNodes.map(node => thumbnail(node.image?.variants))}
    mediaState={mediaState}
    groupState={groupState}
    groupItems={groupItems}
    onRetryMedia={() => void media.refetch()}
    onRetryGroups={() => void groups.refetch()}
  />
}
