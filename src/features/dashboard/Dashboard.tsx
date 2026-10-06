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
import { recentGroups, recentMedia } from "./dashboardData"

function RecentMediaCarousel({ items }: { items: string[] }) {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(8)
  const containerRef = useRef<HTMLDivElement>(null)
  const pageCount = Math.ceil(items.length / pageSize)

  useEffect(() => {
    const element = containerRef.current
    if (!element) return
    const update = (width: number) => {
      const next = Math.max(2, Math.min(8, Math.floor((width + 8) / 140)))
      setPageSize((current) => {
        if (current !== next) setPage(0)
        return next
      })
    }
    const observer = new ResizeObserver(([entry]) => update(entry.contentRect.width))
    observer.observe(element)
    update(element.getBoundingClientRect().width)
    return () => observer.disconnect()
  }, [])

  const visible = items.slice(page * pageSize, page * pageSize + pageSize)

  return (
    <Box ref={containerRef} pos="relative">
      <SimpleGrid cols={pageSize} spacing="xs">
        {visible.map((src, index) => (
          <Box
            key={page * pageSize + index}
            bdrs="md"
            style={{
              aspectRatio: "1 / 1",
              overflow: "hidden",
              border: "1px solid var(--mantine-color-default-border)",
            }}
          >
            <Image src={src} alt={`最近のMedia ${page * pageSize + index + 1}`} w="100%" h="100%" fit="cover" />
          </Box>
        ))}
      </SimpleGrid>
      {page > 0 && (
        <ActionIcon
          aria-label="前のMediaへ"
          variant="filled"
          color="dark"
          radius="xl"
          size="lg"
          onClick={() => setPage((value) => value - 1)}
          style={{ position: "absolute", left: "var(--mantine-spacing-sm)", top: "50%", transform: "translateY(-50%)" }}
        >
          <IconChevronLeft size={22} />
        </ActionIcon>
      )}
      {page < pageCount - 1 && (
        <ActionIcon
          aria-label="次のMediaへ"
          variant="filled"
          color="dark"
          radius="xl"
          size="lg"
          onClick={() => setPage((value) => value + 1)}
          style={{ position: "absolute", right: "var(--mantine-spacing-sm)", top: "50%", transform: "translateY(-50%)" }}
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

function EmptyState({ kind }: { kind: "media" | "group" }) {
  const media = kind === "media"
  return (
    <Center mih={132} px="md" style={{ border: "1px solid var(--mantine-color-default-border)", borderRadius: "var(--mantine-radius-md)" }}>
      <Stack align="center" gap={8}>
        <Group gap={6}>
          {media ? <IconPhoto size={20} stroke={1.5} /> : <IconFolder size={20} stroke={1.5} />}
          <Text size="sm" c="dimmed" fw={500}>{media ? "メディアはまだありません" : "Groupはまだありません"}</Text>
        </Group>
        <Button variant="subtle" size="compact-sm">{media ? "メディアへ移動" : "Groupへ移動"}</Button>
      </Stack>
    </Center>
  )
}

export function Dashboard({ empty = false }: { empty?: boolean }) {
  return (
    <Stack gap="xl" maw={1280} mx="auto" w="100%">
      <Stack gap="sm">
        <Group justify="space-between" align="center" wrap="nowrap">
          <Title order={3} size="h4">最近のメディア</Title>
          {!empty && <Button variant="subtle" size="compact-sm">すべて見る</Button>}
        </Group>
        {empty ? <EmptyState kind="media" /> : <RecentMediaCarousel items={recentMedia} />}
      </Stack>
      <Stack gap="sm">
        <Group justify="space-between" align="center" wrap="nowrap">
          <Title order={3} size="h4">最近のGroup</Title>
          {!empty && <Button variant="subtle" size="compact-sm">すべて見る</Button>}
        </Group>
        {empty ? <EmptyState kind="group" /> : <RecentGroups />}
      </Stack>
    </Stack>
  )
}
