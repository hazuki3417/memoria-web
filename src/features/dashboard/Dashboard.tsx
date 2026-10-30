"use client"

import {
  ActionIcon,
  Box,
  Button,
  Center,
  Group,
  Image,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core"
import {
  IconChevronLeft,
  IconChevronRight,
  IconFolder,
  IconPhoto,
} from "@tabler/icons-react"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { showNotification } from "@/components/Feedback"
import { recentGroups, recentMedia } from "./dashboardData"
import { GroupPreviewGrid } from "@/features/group-browser/GroupPreviewGrid"

function MediaPage({
  items,
  page,
  pageSize,
  mediaIds,
  onOpenMedia,
}: {
  items: string[]
  page: number
  pageSize: number
  mediaIds?: readonly string[]
  onOpenMedia?: (id: string) => void
}) {
  return (
    <SimpleGrid
      cols={pageSize}
      spacing="xs"
      verticalSpacing="xs"
      w="100%"
      style={{ flex: "0 0 50%", width: "50%" }}
    >
      {items.map((src, index) => (
        <Box
          key={page * pageSize + index}
          component={onOpenMedia && mediaIds?.[page * pageSize + index] ? "button" : "div"}
          type={onOpenMedia && mediaIds?.[page * pageSize + index] ? "button" : undefined}
          onClick={onOpenMedia ? () => {
            const id = mediaIds?.[page * pageSize + index]
            if (id) onOpenMedia(id)
          } : undefined}
          aria-label={onOpenMedia && mediaIds?.[page * pageSize + index] ? `Mediaを表示: ${page * pageSize + index + 1}` : undefined}
          bdrs="md"
          style={{
            aspectRatio: "1 / 1",
            padding: 0,
            cursor: onOpenMedia && mediaIds?.[page * pageSize + index] ? "pointer" : "default",
            overflow: "hidden",
            border: "1px solid var(--mantine-color-default-border)",
            background: "var(--mantine-color-default-hover)",
          }}
        >
          {src ? (
            <Image
              src={src}
              alt={`最近のMedia ${page * pageSize + index + 1}`}
              w="100%"
              h="100%"
              fit="cover"
              draggable={false}
            />
          ) : (
            <Center h="100%" aria-label="サムネイルを表示できません">
              <IconPhoto
                size={20}
                stroke={1.5}
                color="var(--mantine-color-dimmed)"
              />
            </Center>
          )}
        </Box>
      ))}
    </SimpleGrid>
  )
}

function RecentMediaCarousel({ items, mediaIds, onOpenMedia }: { items: string[]; mediaIds?: readonly string[]; onOpenMedia?: (id: string) => void }) {
  const [page, setPage] = useState(0)
  const [fromPage, setFromPage] = useState<number | null>(null)
  const [direction, setDirection] = useState<"previous" | "next">("next")
  const [sliding, setSliding] = useState(false)
  const [pageSize, setPageSize] = useState(8)
  const containerRef = useRef<HTMLDivElement>(null)
  const pageCount = Math.ceil(items.length / pageSize)
  const itemsFor = (targetPage: number) =>
    items.slice(targetPage * pageSize, targetPage * pageSize + pageSize)
  const hasPrevious = page > 0
  const hasNext = page < pageCount - 1

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const updatePageSize = (width: number) => {
      const gap = 8
      const targetThumbnailWidth = 132
      const nextPageSize = Math.max(
        2,
        Math.min(8, Math.floor((width + gap) / (targetThumbnailWidth + gap))),
      )
      setPageSize((current) => {
        if (current === nextPageSize) return current
        setPage(0)
        setFromPage(null)
        setSliding(false)
        return nextPageSize
      })
    }

    const observer = new ResizeObserver(([entry]) => {
      if (entry) updatePageSize(entry.contentRect.width)
    })
    observer.observe(element)
    updatePageSize(element.getBoundingClientRect().width)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!sliding) return
    const timer = window.setTimeout(() => {
      setSliding(false)
      setFromPage(null)
    }, 260)
    return () => window.clearTimeout(timer)
  }, [sliding])

  const moveTo = (targetPage: number, nextDirection: "previous" | "next") => {
    if (sliding || targetPage === page) return
    setFromPage(page)
    setDirection(nextDirection)
    setPage(targetPage)
    requestAnimationFrame(() => requestAnimationFrame(() => setSliding(true)))
  }

  const oldPage = fromPage ?? page

  return (
    <Box ref={containerRef} pos="relative" style={{ overflow: "hidden" }}>
      <style>{`
        .dashboard-carousel-track {
          display: flex;
          width: 200%;
          will-change: transform;
        }
        .dashboard-carousel-track.next { transform: translateX(0); }
        .dashboard-carousel-track.next.sliding { transform: translateX(-50%); }
        .dashboard-carousel-track.previous { transform: translateX(-50%); }
        .dashboard-carousel-track.previous.sliding { transform: translateX(0); }
        .dashboard-carousel-track.sliding { transition: transform 260ms ease; }
        @media (prefers-reduced-motion: reduce) {
          .dashboard-carousel-track.sliding { transition: none; }
        }
      `}</style>

      {fromPage === null ? (
        <MediaPage items={itemsFor(page)} page={page} pageSize={pageSize} mediaIds={mediaIds} onOpenMedia={onOpenMedia} />
      ) : (
        <Box
          className={`dashboard-carousel-track ${direction} ${sliding ? "sliding" : ""}`}
        >
          {direction === "next" ? (
            <>
              <MediaPage
                items={itemsFor(oldPage)}
                page={oldPage}
                pageSize={pageSize}
                mediaIds={mediaIds}
                onOpenMedia={onOpenMedia}
              />
              <MediaPage
                items={itemsFor(page)}
                page={page}
                pageSize={pageSize}
                mediaIds={mediaIds}
                onOpenMedia={onOpenMedia}
              />
            </>
          ) : (
            <>
              <MediaPage
                items={itemsFor(page)}
                page={page}
                pageSize={pageSize}
                mediaIds={mediaIds}
                onOpenMedia={onOpenMedia}
              />
              <MediaPage
                items={itemsFor(oldPage)}
                page={oldPage}
                pageSize={pageSize}
                mediaIds={mediaIds}
                onOpenMedia={onOpenMedia}
              />
            </>
          )}
        </Box>
      )}

      {hasPrevious && (
        <Box
          aria-hidden="true"
          pos="absolute"
          top={0}
          bottom={0}
          left={0}
          w={72}
          style={{
            pointerEvents: "none",
            zIndex: 1,
            background:
              "linear-gradient(90deg, var(--mantine-color-body), transparent)",
          }}
        />
      )}
      {hasNext && (
        <Box
          aria-hidden="true"
          pos="absolute"
          top={0}
          bottom={0}
          right={0}
          w={72}
          style={{
            pointerEvents: "none",
            zIndex: 1,
            background:
              "linear-gradient(270deg, var(--mantine-color-body), transparent)",
          }}
        />
      )}
      {hasPrevious && (
        <ActionIcon
          aria-label="前のMediaへ"
          variant="filled"
          color="dark"
          radius="xl"
          size="lg"
          disabled={sliding}
          onClick={() => moveTo(page - 1, "previous")}
          style={{
            position: "absolute",
            left: "var(--mantine-spacing-sm)",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
          }}
        >
          <IconChevronLeft size={22} />
        </ActionIcon>
      )}
      {hasNext && (
        <ActionIcon
          aria-label="次のMediaへ"
          variant="filled"
          color="dark"
          radius="xl"
          size="lg"
          disabled={sliding}
          onClick={() => moveTo(page + 1, "next")}
          style={{
            position: "absolute",
            right: "var(--mantine-spacing-sm)",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
          }}
        >
          <IconChevronRight size={22} />
        </ActionIcon>
      )}
    </Box>
  )
}

export type DashboardGroup = {
  id: string
  name: string
  media: string[]
  mediaCount: number
}

function RecentGroups({ groups }: { groups: DashboardGroup[] }) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
      {groups.map((group) => (
        <Stack
          key={group.id}
          gap={8}
          p="xs"
          bdrs="md"
          bg="var(--mantine-color-default-hover)"
        >
          <Text size="sm">{group.name}</Text>
          <GroupPreviewGrid
            count={group.mediaCount}
            sources={group.media}
            remote
          />
        </Stack>
      ))}
    </SimpleGrid>
  )
}

function SectionFeedback({
  state,
  onRetry,
  kind,
}: {
  state: "loading" | "error"
  onRetry?: () => void
  kind: "media" | "group"
}) {
  return (
    <Center mih={132}>
      {state === "loading" ? (
        <Text size="sm" c="dimmed" role="status">
          読み込み中です
        </Text>
      ) : (
        <Stack gap="xs" align="center" role="alert">
          <Text size="sm" c="dimmed">
            {kind === "media" ? "メディア" : "Group"}を取得できませんでした
          </Text>
          <Button variant="subtle" size="compact-sm" onClick={onRetry}>
            再試行
          </Button>
        </Stack>
      )}
    </Center>
  )
}

function EmptyState({ kind, href }: { kind: "media" | "group"; href: string }) {
  const media = kind === "media"
  return (
    <Center
      mih={132}
      px="md"
      style={{
        border: "1px solid var(--mantine-color-default-border)",
        borderRadius: "var(--mantine-radius-md)",
      }}
    >
      <Stack align="center" gap={8}>
        <Group gap={6}>
          {media ? (
            <IconPhoto size={20} stroke={1.5} />
          ) : (
            <IconFolder size={20} stroke={1.5} />
          )}
          <Text size="sm" c="dimmed" fw={500}>
            {media ? "メディアはまだありません" : "Groupはまだありません"}
          </Text>
        </Group>
        <Button component={Link} href={href} variant="subtle" size="compact-sm">
          {media ? "メディアへ移動" : "Groupへ移動"}
        </Button>
      </Stack>
    </Center>
  )
}

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
    <>
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
    </>
  )
}
