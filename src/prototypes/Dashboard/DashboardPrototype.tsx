"use client"

import { ActionIcon, Box, Button, Center, Group, Image, SimpleGrid, Stack, Text, Title } from "@mantine/core"
import { IconChevronLeft, IconChevronRight, IconPhoto } from "@tabler/icons-react"
import { useState } from "react"
import { getApplicationNavigation } from "@/components/ApplicationShell"
import { PrototypeApplicationShell } from "@/prototypes/PrototypeApplicationShell"

type ContextKind = "personal" | "community"
type DashboardState = "default" | "empty"

const contexts = [
  { id: "personal", kind: "personal" as const, label: "Personal", accentColor: "var(--mantine-color-blue-6)" },
  { id: "community", kind: "community" as const, label: "家族のアルバム", accentColor: "var(--mantine-color-teal-6)" },
]

const media = [
  "/media-browser/h-01.png", "/media-browser/w-01.png",
  "/group-browser/group-media-01.jpg", "/group-browser/group-media-02.jpg",
  "/media-browser/h-02.png", "/group-browser/group-media-03.jpg",
  "/group-browser/group-media-04.jpg", "/media-browser/w-02.png",
  "/group-browser/group-media-05.jpg", "/group-browser/group-media-06.jpg",
  "/group-browser/group-media-07.jpg", "/group-browser/group-media-08.jpg",
]

function RecentMediaCarousel() {
  const [page, setPage] = useState(0)
  const pageSize = 4
  const pageCount = Math.ceil(media.length / pageSize)
  const items = media.slice(page * pageSize, page * pageSize + pageSize)
  const hasPrevious = page > 0
  const hasNext = page < pageCount - 1

  return (
    <Box pos="relative">
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs" verticalSpacing="xs">
        {items.map((src, index) => (
          <Box
            key={src}
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
            }}
          />
          <ActionIcon
            aria-label="前のMediaへ"
            variant="filled"
            color="dark"
            radius="xl"
            size="lg"
            pos="absolute"
            left="sm"
            top="50%"
            style={{ transform: "translateY(-50%)" }}
            onClick={() => setPage((current) => Math.max(0, current - 1))}
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
            }}
          />
          <ActionIcon
            aria-label="次のMediaへ"
            variant="filled"
            color="dark"
            radius="xl"
            size="lg"
            pos="absolute"
            right="sm"
            top="50%"
            style={{ transform: "translateY(-50%)" }}
            onClick={() =>
              setPage((current) => Math.min(pageCount - 1, current + 1))
            }
          >
            <IconChevronRight size={22} />
          </ActionIcon>
        </>
      )}
    </Box>
  )
}

export function DashboardPrototype({ initialContext = "personal", initialState = "default" }: { initialContext?: ContextKind; initialState?: DashboardState }) {
  const [contextKind, setContextKind] = useState<ContextKind>(initialContext)
  const currentContext = contexts.find((context) => context.kind === contextKind) ?? contexts[0]
  const navigationItems = getApplicationNavigation({ contextKind, activeSection: "dashboard" })

  return (
    <PrototypeApplicationShell
      currentContext={currentContext}
      contexts={contexts}
      navigationItems={navigationItems}
      user={{ displayName: "Hazuki" }}
      onSelectContext={(id) => setContextKind(id === "community" ? "community" : "personal")}
      onSelectNavigation={() => undefined}
      onCreateCommunity={() => undefined}
      onOpenSettings={() => undefined}
      onLogout={() => undefined}
    >
      <Stack gap="xl" maw={1280} mx="auto" w="100%">
        <Box>
          <Title order={2} size="h3">{contextKind === "personal" ? "Personal" : currentContext.label}</Title>
          <Text size="sm" c="dimmed" mt={4}>最近のMediaを確認して、現在のContextの主要な機能へ移動できます。</Text>
        </Box>
        <Stack gap="sm">
          <Group justify="space-between" align="center" wrap="nowrap">
            <Title order={3} size="h4">最近のメディア</Title>
            {initialState === "default" && <Button variant="subtle" size="compact-sm">すべて見る</Button>}
          </Group>
          {initialState === "default" ? <RecentMediaCarousel /> : (
            <Center mih={280} px="md" style={{ border: "1px solid var(--mantine-color-default-border)", borderRadius: "var(--mantine-radius-md)" }}>
              <Stack align="center" gap="sm">
                <IconPhoto size={36} stroke={1.4} color="var(--mantine-color-dimmed)" aria-hidden="true" />
                <Text fw={650}>メディアはまだありません</Text>
                <Button variant="default">メディアへ移動</Button>
              </Stack>
            </Center>
          )}
        </Stack>
      </Stack>
    </PrototypeApplicationShell>
  )
}
