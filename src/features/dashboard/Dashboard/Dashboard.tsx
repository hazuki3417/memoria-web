"use client"

import { Button, Group, Stack, Title } from "@mantine/core"
import Link from "next/link"
import { useEffect } from "react"
import { showNotification } from "@/components/Feedback"
import { recentGroups, recentMedia } from "../dashboardData"
import { RecentMediaCarousel } from "./RecentMediaCarousel"
import { RecentGroups } from "./RecentGroups"
import { SectionFeedback } from "./SectionFeedback"
import { EmptyState } from "./EmptyState"
import type { DashboardGroup } from "./dashboardTypes"
export type { DashboardGroup } from "./dashboardTypes"

export function Dashboard({
  empty = false,
  contextKind = "personal",
  communityId = "photo-club",
  mediaItems,
  mediaIds,
  onOpenMedia,
  groupItems,
  mediaState,
  groupState,
  onRetryMedia,
  onRetryGroups,
}: {
  empty?: boolean
  contextKind?: "personal" | "community"
  communityId?: string
  mediaItems?: string[]
  mediaIds?: readonly string[]
  onOpenMedia?: (id: string) => void
  groupItems?: DashboardGroup[]
  mediaState?: "loading" | "error" | "ready"
  groupState?: "loading" | "error" | "ready"
  onRetryMedia?: () => void
  onRetryGroups?: () => void
}) {
  useEffect(() => {
    if (contextKind !== "personal") return
    if (window.sessionStorage.getItem("memoria:registration-success") !== "1")
      return
    window.sessionStorage.removeItem("memoria:registration-success")
    showNotification({
      kind: "success",
      title: "User登録",
      description: "登録が完了しました。",
    })
  }, [contextKind])
  const prefix =
    contextKind === "community" ? `/communities/${communityId}` : ""
  const mediaHref = `${prefix}/media`
  const groupsHref = `${prefix}/groups`
  const media = mediaItems ?? recentMedia
  const groups =
    groupItems ??
    recentGroups.map((group, index) => ({
      ...group,
      id: String(index),
      mediaCount: group.media.length,
    }))
  const noMedia = empty || (mediaState === "ready" && media.length === 0)
  const noGroups = empty || (groupState === "ready" && groups.length === 0)

  return (
    <Stack gap="xl" w="100%">
        <Stack gap="sm">
          <Group justify="space-between" align="center" wrap="nowrap">
            <Title order={3} size="h4">
              最近のメディア
            </Title>
            {!noMedia && mediaState !== "loading" && mediaState !== "error" && (
              <Button
                variant="subtle"
                size="compact-sm"
                component={Link}
                href={mediaHref}
              >
                すべて見る
              </Button>
            )}
          </Group>
          {mediaState === "loading" || mediaState === "error" ? (
            <SectionFeedback
              state={mediaState}
              onRetry={onRetryMedia}
              kind="media"
            />
          ) : noMedia ? (
            <EmptyState kind="media" href={mediaHref} />
          ) : (
            <RecentMediaCarousel
              key={contextKind + communityId}
              items={media.slice(0, 32)}
              mediaIds={mediaIds}
              onOpenMedia={onOpenMedia}
            />
          )}
        </Stack>
        <Stack gap="sm">
          <Group justify="space-between" align="center" wrap="nowrap">
            <Title order={3} size="h4">
              最近のGroup
            </Title>
            {!noGroups &&
              groupState !== "loading" &&
              groupState !== "error" && (
                <Button
                  variant="subtle"
                  size="compact-sm"
                  component={Link}
                  href={groupsHref}
                >
                  すべて見る
                </Button>
              )}
          </Group>
          {groupState === "loading" || groupState === "error" ? (
            <SectionFeedback
              state={groupState}
              onRetry={onRetryGroups}
              kind="group"
            />
          ) : noGroups ? (
            <EmptyState kind="group" href={groupsHref} />
          ) : (
            <RecentGroups groups={groups} />
          )}
        </Stack>
    </Stack>
  )
}
