"use client"

import { gql, useQuery } from "@apollo/client"
import { useEffect, useMemo, useRef } from "react"
import { MediaGroupSort, ScopeType, useBrowseGroupsQuery } from "@/infrastructure/graphql/generated"
import { Dashboard, type DashboardGroup } from "./Dashboard"

type Scope = { type: ScopeType; communityId?: string }
type MediaResponse = {
  mediaList: {
    edges: Array<{ node: {
      id: string
      image: { variants: Array<{ url: string; width: number }> } | null
    } }>
  }
}
type PreviewResponse = {
  mediaGroup: {
    id: string
    media: { edges: Array<{ node: {
      id: string
      image: { variants: Array<{ url: string; width: number }> } | null
    } }> }
  } | null
}

const DASHBOARD_MEDIA = gql`
  query DashboardRecentMedia($scope: ScopeInput!) {
    mediaList(scope: $scope, first: 32) {
      edges { node { id image { variants { url width } } } }
    }
  }
`

const DASHBOARD_GROUP_PREVIEW = gql`
  query DashboardGroupPreview($id: ID!) {
    mediaGroup(id: $id) {
      id
      media(first: 4) {
        edges { node { id image { variants { url width } } } }
      }
    }
  }
`

function thumbnail(variants: Array<{ url: string; width: number }> = []): string {
  const sorted = variants.filter((item) => item.url).sort((a, b) => a.width - b.width)
  return sorted.find((item) => item.width >= 320)?.url ?? sorted.at(-1)?.url ?? ""
}

function GroupPreview({ id, name }: { id: string; name: string }) {
  const result = useQuery<PreviewResponse>(DASHBOARD_GROUP_PREVIEW, {
    variables: { id },
    fetchPolicy: "network-only",
  })
  const nodes = result.data?.mediaGroup?.media.edges.map((edge) => edge.node) ?? []
  // Never substitute invented imagery for failed or unavailable signed URLs.
  const group: DashboardGroup = {
    id,
    name,
    mediaCount: nodes.length,
    media: nodes.map((node) => thumbnail(node.image?.variants)),
  }
  return { group, loading: result.loading, error: result.error, refetch: result.refetch }
}

// Keep every hook inside a React component; per-group previews are rendered by
// the scoped listing below and never fetched for a group outside that listing.
function DashboardGroupItem({ id, name }: { id: string; name: string }) {
  const { group, loading, error, refetch } = GroupPreview({ id, name })
  return <DashboardGroupsVisual group={group} loading={loading} failed={Boolean(error)} onRetry={() => void refetch()} />
}

import { Button, Center, SimpleGrid, Stack, Text } from "@mantine/core"
import { GroupPreviewGrid } from "@/features/group-browser/GroupPreviewGrid"

function DashboardGroupsVisual({ group, loading, failed, onRetry }: {
  group: DashboardGroup; loading: boolean; failed: boolean; onRetry: () => void
}) {
  return <Stack gap={8} p="xs" bdrs="md" bg="var(--mantine-color-default-hover)">
    <Text size="sm">{group.name}</Text>
    {failed ? <Center><Button size="xs" variant="subtle" onClick={onRetry}>Previewを再試行</Button></Center>
      : loading ? <Text size="xs" c="dimmed" role="status">Previewを読み込み中です</Text>
      : <GroupPreviewGrid count={group.mediaCount} sources={group.media} remote />}
  </Stack>
}

function DashboardGroupList({ groups }: { groups: Array<{ id: string; name: string }> }) {
  return <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
    {groups.map(group => <DashboardGroupItem key={group.id} id={group.id} name={group.name} />)}
  </SimpleGrid>
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
  const groups = useBrowseGroupsQuery({
    variables: { scope, sort: MediaGroupSort.CreatedAtDesc, first: 6 },
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

  const groupNodes = groups.data?.mediaGroups.edges.map(edge => edge.node) ?? []
  const mediaNodes = media.data?.mediaList.edges.map(edge => edge.node) ?? []
  const mediaState = skip || media.error ? "error" : !media.data ? "loading" : "ready"
  const groupState = skip || groups.error ? "error" : !groups.data ? "loading" : "ready"
  return <Dashboard
    contextKind={contextKind}
    communityId={communityId}
    mediaItems={mediaNodes.map(node => thumbnail(node.image?.variants))}
    mediaState={mediaState}
    groupState={groupState}
    groupItems={[]}
    groupContent={groupState === "ready" ? <DashboardGroupList groups={groupNodes} /> : undefined}
    onRetryMedia={() => void media.refetch()}
    onRetryGroups={() => void groups.refetch()}
  />
}
