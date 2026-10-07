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
import { recentGroups, recentMedia } from "./dashboardData"

function MediaPage({
  items,
  page,
  pageSize,
}: {
  items: string[]
  page: number
  pageSize: number
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
          bdrs="md"
          style={{
            aspectRatio: "1 / 1",
            overflow: "hidden",
            border: "1px solid var(--mantine-color-default-border)",
            background: "var(--mantine-color-default-hover)",
          }}
        >
          <Image
            src={src}
            alt={`最近のMedia ${page * pageSize + index + 1}`}
            w="100%"
            h="100%"
            fit="cover"
            draggable={false}
          />
        </Box>
      ))}
    </SimpleGrid>
  )
}

function RecentMediaCarousel({ items }: { items: string[] }) {
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
        <MediaPage items={itemsFor(page)} page={page} pageSize={pageSize} />
      ) : (
        <Box className={`dashboard-carousel-track ${direction} ${sliding ? "sliding" : ""}`}>
          {direction === "next" ? (
            <>
              <MediaPage items={itemsFor(oldPage)} page={oldPage} pageSize={pageSize} />
              <MediaPage items={itemsFor(page)} page={page} pageSize={pageSize} />
            </>
          ) : (
            <>
              <MediaPage items={itemsFor(page)} page={page} pageSize={pageSize} />
              <MediaPage items={itemsFor(oldPage)} page={oldPage} pageSize={pageSize} />
            </>
          )}
        </Box>
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
          style={{ position: "absolute", left: "var(--mantine-spacing-sm)", top: "50%", transform: "translateY(-50%)", zIndex: 2 }}
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
          style={{ position: "absolute", right: "var(--mantine-spacing-sm)", top: "50%", transform: "translateY(-50%)", zIndex: 2 }}
        >
          <IconChevronRight size={22} />
        </ActionIcon>
      )}
    </Box>
  )
}

function RecentGroups() {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
      {recentGroups.map((group) => (
        <Stack key={group.name} gap={8} p="xs" bdrs="md" bg="var(--mantine-color-default-hover)">
          <Text fw={600} size="sm">{group.name}</Text>
          <SimpleGrid cols={2} spacing={4}>
            {Array.from({ length: 4 }, (_, index) => {
              const src = group.media[index]
              return (
                <Box key={index} bdrs="sm" style={{ aspectRatio: "1 / 1", overflow: "hidden", background: "var(--mantine-color-default-hover)" }}>
                  {src ? (
                    <Image src={src} alt="" w="100%" h="100%" fit="cover" />
                  ) : (
                    <Center h="100%"><IconPhoto size={20} stroke={1.5} /></Center>
                  )}
                </Box>
              )
            })}
          </SimpleGrid>
        </Stack>
      ))}
    </SimpleGrid>
  )
}

function EmptyState({ kind, href }: { kind: "media" | "group"; href: string }) {
  const media = kind === "media"
  return (
    <Center mih={132} px="md" style={{ border: "1px solid var(--mantine-color-default-border)", borderRadius: "var(--mantine-radius-md)" }}>
      <Stack align="center" gap={8}>
        <Group gap={6}>
          {media ? <IconPhoto size={20} stroke={1.5} /> : <IconFolder size={20} stroke={1.5} />}
          <Text size="sm" c="dimmed" fw={500}>{media ? "メディアはまだありません" : "Groupはまだありません"}</Text>
        </Group>
        <Button component={Link} href={href} variant="subtle" size="compact-sm">{media ? "メディアへ移動" : "Groupへ移動"}</Button>
      </Stack>
    </Center>
  )
}

export function Dashboard({ empty = false, contextKind = "personal", communityId = "photo-club" }: { empty?: boolean; contextKind?: "personal" | "community"; communityId?: string }) {
  const prefix = contextKind === "community" ? `/communities/${communityId}` : ""
  const mediaHref = `${prefix}/media`
  const groupsHref = `${prefix}/groups`

  return (
    <Stack gap="xl" maw={1280} mx="auto" w="100%">
      <Stack gap="sm">
        <Group justify="space-between" align="center" wrap="nowrap">
          <Title order={3} size="h4">最近のメディア</Title>
          {!empty && <Button variant="subtle" size="compact-sm" component={Link} href={mediaHref}>すべて見る</Button>}
        </Group>
        {empty ? <EmptyState kind="media" href={mediaHref} /> : <RecentMediaCarousel items={recentMedia} />}
      </Stack>
      <Stack gap="sm">
        <Group justify="space-between" align="center" wrap="nowrap">
          <Title order={3} size="h4">最近のGroup</Title>
          {!empty && <Button variant="subtle" size="compact-sm" component={Link} href={groupsHref}>すべて見る</Button>}
        </Group>
        {empty ? <EmptyState kind="group" href={groupsHref} /> : <RecentGroups />}
      </Stack>
    </Stack>
  )
}
