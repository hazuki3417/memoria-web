"use client"

import { GroupItem } from "@/components/GroupItem"

import {
  ActionIcon,
  Box,
  Button,
  Center,
  Image,
  Group,
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
import { getApplicationNavigation } from "@/components/ApplicationShell"
import { PrototypeApplicationShell } from "@/prototypes/PrototypeApplicationShell"

type ContextKind = "personal" | "community"
type DashboardState = "default" | "empty"

const contexts = [
  {
    id: "personal",
    kind: "personal" as const,
    label: "Personal",
    accentColor: "var(--mantine-color-blue-6)",
  },
  {
    id: "community",
    kind: "community" as const,
    label: "家族のアルバム",
    accentColor: "var(--mantine-color-teal-6)",
  },
]

const media = [
  { src: "/media-browser/h-01.png", id: 1 },
  { src: "/media-browser/w-01.png", id: 2 },
  { src: "/group-browser/group-media-01.jpg", id: 3 },
  { src: "/group-browser/group-media-02.jpg", id: 4 },
  { src: "/media-browser/h-02.png", id: 5 },
  { src: "/group-browser/group-media-03.jpg", id: 6 },
  { src: "/group-browser/group-media-04.jpg", id: 7 },
  { src: "/media-browser/w-02.png", id: 8 },
  { src: "/group-browser/group-media-05.jpg", id: 9 },
  { src: "/group-browser/group-media-06.jpg", id: 10 },
  { src: "/group-browser/group-media-07.jpg", id: 11 },
  { src: "/group-browser/group-media-08.jpg", id: 12 },
  { src: "/media-browser/h-01.png", id: 13 },
  { src: "/media-browser/w-01.png", id: 14 },
  { src: "/group-browser/group-media-01.jpg", id: 15 },
  { src: "/group-browser/group-media-02.jpg", id: 16 },
  { src: "/media-browser/h-02.png", id: 17 },
  { src: "/group-browser/group-media-03.jpg", id: 18 },
  { src: "/group-browser/group-media-04.jpg", id: 19 },
  { src: "/media-browser/w-02.png", id: 20 },
  { src: "/group-browser/group-media-05.jpg", id: 21 },
  { src: "/group-browser/group-media-06.jpg", id: 22 },
  { src: "/group-browser/group-media-07.jpg", id: 23 },
  { src: "/group-browser/group-media-08.jpg", id: 24 },
  { src: "/media-browser/h-01.png", id: 25 },
  { src: "/media-browser/w-01.png", id: 26 },
  { src: "/group-browser/group-media-01.jpg", id: 27 },
  { src: "/group-browser/group-media-02.jpg", id: 28 },
  { src: "/media-browser/h-02.png", id: 29 },
  { src: "/group-browser/group-media-03.jpg", id: 30 },
  { src: "/group-browser/group-media-04.jpg", id: 31 },
  { src: "/media-browser/w-02.png", id: 32 },
]

const recentGroups = [
  {
    name: "旅行",
    media: [
      "/group-browser/group-media-01.jpg",
      "/group-browser/group-media-02.jpg",
      "/group-browser/group-media-03.jpg",
      "/group-browser/group-media-04.jpg",
    ],
    nestedGroups: 0,
  },
  {
    name: "家族",
    media: [
      "/media-browser/h-01.png",
      "/media-browser/w-01.png",
      "/group-browser/group-media-05.jpg",
    ],
    nestedGroups: 0,
  },
  {
    name: "風景",
    media: ["/media-browser/h-02.png", "/media-browser/w-02.png"],
    nestedGroups: 0,
  },
  { name: "お気に入り", media: ["/media-browser/w-01.png"], nestedGroups: 0 },
  {
    name: "イベント",
    media: [
      "/group-browser/group-media-06.jpg",
      "/group-browser/group-media-07.jpg",
    ],
    nestedGroups: 2,
  },
  { name: "記録", media: [], nestedGroups: 4 },
]

function RecentGroups() {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
      {recentGroups.map((group) => (
        <Stack
          key={group.name}
          gap={8}
          p="xs"
          bdrs="md"
          bg="var(--mantine-color-default-hover)"
        >
          <GroupItem
            name={group.name}
            directMedia={group.media}
            aggregateMedia={Array.from({ length: 12 }, (_, index) => `/group-browser/group-media-${String((index % 9) + 1).padStart(2, "0")}.jpg`)}
            gap={8}
          />
        </Stack>
      ))}
    </SimpleGrid>
  )
}

function MediaPage({
  items,
  page,
  pageSize,
  columns,
}: {
  items: typeof media
  page: number
  pageSize: number
  columns: number
}) {
  return (
    <SimpleGrid
      cols={columns}
      spacing="xs"
      verticalSpacing="xs"
      w="100%"
      style={{ flex: "0 0 50%", width: "50%" }}
    >
      {items.map((item, index) => (
        <Box
          key={item.id}
          bdrs="md"
          style={{
            aspectRatio: "1 / 1",
            overflow: "hidden",
            border: "1px solid var(--mantine-color-default-border)",
            background: "var(--mantine-color-default-hover)",
          }}
        >
          <Image
            src={item.src}
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

function RecentMediaCarousel() {
  const [page, setPage] = useState(0)
  const [fromPage, setFromPage] = useState<number | null>(null)
  const [direction, setDirection] = useState<"previous" | "next">("next")
  const [sliding, setSliding] = useState(false)
  const [pageSize, setPageSize] = useState(8)
  const containerRef = useRef<HTMLDivElement>(null)
  const pageCount = Math.ceil(media.length / pageSize)
  const itemsFor = (targetPage: number) =>
    media.slice(targetPage * pageSize, targetPage * pageSize + pageSize)
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

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
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
        <MediaPage
          items={itemsFor(page)}
          page={page}
          pageSize={pageSize}
          columns={pageSize}
        />
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
                columns={pageSize}
              />
              <MediaPage
                items={itemsFor(page)}
                page={page}
                pageSize={pageSize}
                columns={pageSize}
              />
            </>
          ) : (
            <>
              <MediaPage
                items={itemsFor(page)}
                page={page}
                pageSize={pageSize}
                columns={pageSize}
              />
              <MediaPage
                items={itemsFor(oldPage)}
                page={oldPage}
                pageSize={pageSize}
                columns={pageSize}
              />
            </>
          )}
        </Box>
      )}

      {hasPrevious && (
        <>
          <Box
            aria-hidden="true"
            pos="absolute"
            top={0}
            bottom={0}
            left={0}
            w={72}
            style={{
              pointerEvents: "none",
              background:
                "linear-gradient(90deg, var(--mantine-color-body), transparent)",
              zIndex: 1,
            }}
          />
          <ActionIcon
            aria-label="前のMediaへ"
            variant="filled"
            color="dark"
            radius="xl"
            size="lg"
            style={{
              position: "absolute",
              left: "var(--mantine-spacing-sm)",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 2,
            }}
            onClick={() => moveTo(page - 1, "previous")}
          >
            <IconChevronLeft size={22} />
          </ActionIcon>
        </>
      )}

      {hasNext && (
        <>
          <Box
            aria-hidden="true"
            pos="absolute"
            top={0}
            bottom={0}
            right={0}
            w={72}
            style={{
              pointerEvents: "none",
              background:
                "linear-gradient(270deg, var(--mantine-color-body), transparent)",
              zIndex: 1,
            }}
          />
          <ActionIcon
            aria-label="次のMediaへ"
            variant="filled"
            color="dark"
            radius="xl"
            size="lg"
            style={{
              position: "absolute",
              right: "var(--mantine-spacing-sm)",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 2,
            }}
            onClick={() => moveTo(page + 1, "next")}
          >
            <IconChevronRight size={22} />
          </ActionIcon>
        </>
      )}
    </Box>
  )
}

export function DashboardPrototype({
  initialContext = "personal",
  initialState = "default",
}: {
  initialContext?: ContextKind
  initialState?: DashboardState
}) {
  const [contextKind, setContextKind] = useState<ContextKind>(initialContext)
  const currentContext =
    contexts.find((context) => context.kind === contextKind) ?? contexts[0]
  const navigationItems = getApplicationNavigation({
    contextKind,
    activeSection: "dashboard",
  })

  return (
    <PrototypeApplicationShell
      currentContext={currentContext}
      contexts={contexts}
      navigationItems={navigationItems}
      user={{ displayName: "Hazuki" }}
      onSelectContext={(id) =>
        setContextKind(id === "community" ? "community" : "personal")
      }
      onSelectNavigation={() => undefined}
      onCreateCommunity={() => undefined}
      onOpenSettings={() => undefined}
      onLogout={() => undefined}
    >
      <Stack gap="xl" maw={1280} mx="auto" w="100%">
        <Stack gap="sm">
          <Group justify="space-between" align="center" wrap="nowrap">
            <Title order={3} size="h4">
              最近のメディア
            </Title>
            {initialState === "default" && (
              <Button variant="subtle" size="compact-sm">
                すべて見る
              </Button>
            )}
          </Group>
          {initialState === "default" ? (
            <RecentMediaCarousel />
          ) : (
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
                  <IconPhoto
                    size={20}
                    stroke={1.5}
                    color="var(--mantine-color-dimmed)"
                    aria-hidden="true"
                  />
                  <Text size="sm" c="dimmed" fw={500}>
                    メディアはまだありません
                  </Text>
                </Group>
                <Button variant="subtle" size="compact-sm">
                  メディアへ移動
                </Button>
              </Stack>
            </Center>
          )}
        </Stack>
        <Stack gap="sm">
          <Group justify="space-between" align="center" wrap="nowrap">
            <Title order={3} size="h4">
              最近のGroup
            </Title>
            {initialState === "default" && (
              <Button variant="subtle" size="compact-sm">
                すべて見る
              </Button>
            )}
          </Group>
          {initialState === "default" ? (
            <RecentGroups />
          ) : (
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
                  <IconFolder
                    size={20}
                    stroke={1.5}
                    color="var(--mantine-color-dimmed)"
                    aria-hidden="true"
                  />
                  <Text size="sm" c="dimmed" fw={500}>
                    Groupはまだありません
                  </Text>
                </Group>
                <Button variant="subtle" size="compact-sm">
                  Groupへ移動
                </Button>
              </Stack>
            </Center>
          )}
        </Stack>
      </Stack>
    </PrototypeApplicationShell>
  )
}
