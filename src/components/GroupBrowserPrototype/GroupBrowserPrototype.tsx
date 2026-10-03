"use client"

import {
  ActionIcon, Badge, Box, Button, Divider, Group, Menu, Paper, ScrollArea,
  SimpleGrid, Stack, Text, TextInput, UnstyledButton,
} from "@mantine/core"
import { useDisclosure, useMediaQuery } from "@mantine/hooks"
import {
  IconChevronDown, IconChevronRight, IconDots, IconEdit, IconPlus,
  IconLayoutDashboard, IconPhoto, IconSearch, IconTrash, IconUsers, IconX,
} from "@tabler/icons-react"
import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useMemo, useState } from "react"
import { useGroupRef } from "react-resizable-panels"
import { ApplicationShell } from "@/components/ApplicationShell"
import { SplitView } from "@/components/SplitView"

type PrototypeGroup = {
  id: string
  name: string
  mediaCount: number
  previewCount: number
  parentNames: string[]
  childNames: string[]
}

const groups: PrototypeGroup[] = [
  { id: "travel", name: "旅行", mediaCount: 128, previewCount: 7, parentNames: ["2026"], childNames: ["北海道", "東北", "関東"] },
  { id: "family", name: "家族", mediaCount: 84, previewCount: 4, parentNames: [], childNames: ["イベント"] },
  { id: "food", name: "料理", mediaCount: 42, previewCount: 3, parentNames: ["日常"], childNames: [] },
  { id: "landscape", name: "風景写真", mediaCount: 31, previewCount: 1, parentNames: [], childNames: [] },
  { id: "archive", name: "あとで整理する写真と動画をまとめた非常に長い名前のGroup", mediaCount: 18, previewCount: 2, parentNames: ["アーカイブ"], childNames: ["未整理"] },
  { id: "empty", name: "新しいGroup", mediaCount: 3, previewCount: 0, parentNames: [], childNames: [] },
]

const personalContext = {
  id: "personal",
  kind: "personal" as const,
  label: "Personal",
  accentColor: "var(--mantine-color-blue-6)",
}

const applicationNavigation = [
  { id: "dashboard", label: "ダッシュボード", icon: IconLayoutDashboard },
  { id: "media", label: "メディア", icon: IconPhoto },
  { id: "groups", label: "グループ", icon: IconUsers, active: true },
]

const previewImages = Array.from(
  { length: 9 },
  (_, index) => `/group-browser/group-media-${String(index + 1).padStart(2, "0")}.jpg`,
)

function GroupVisual({ startIndex }: { startIndex: number }) {
  const mediaIndexes = Array.from({ length: 3 }, (_, index) => startIndex + index)

  return (
    <Box
      w="100%"
      h="100%"
      bg="var(--mantine-color-default-hover)"
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap: 2,
        overflow: "hidden",
      }}
    >
      {mediaIndexes.map((mediaIndex, index) => (
        <Box
          key={mediaIndex}
          style={{
            gridRow: index === 0 ? "1 / 3" : undefined,
            backgroundImage: `url("${previewImages[mediaIndex % previewImages.length]}")`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
      ))}
    </Box>
  )
}

function PreviewGrid({ count }: { count: number }) {
  let groupVisualIndex = 0
  return (
    <SimpleGrid cols={2} spacing={4}>
      {Array.from({ length: 4 }, (_, index) => {
        const media = index < Math.min(count, 4)
        const continuation = count > 4 && index === 3
        const groupVisualStart = groupVisualIndex * 3
        if (!media) groupVisualIndex += 1
        return (
          <Box
            key={index}
            bdrs="sm"
            style={{
              position: "relative",
              aspectRatio: "1 / 1",
              border: media ? "1px solid var(--mantine-color-default-border)" : undefined,
              overflow: "hidden",
              ...(media
                ? {
                    backgroundImage: `url("${previewImages[index % previewImages.length]}")`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                  }
                : {}),
            }}
          >
            {!media && <GroupVisual startIndex={groupVisualStart} />}
            {continuation && (
              <Box
                pos="absolute"
                inset={0}
                bg="rgba(0, 0, 0, 0.32)"
                style={{ display: "grid", placeItems: "center" }}
              >
                <Text c="white" fw={700} size="lg">…</Text>
              </Box>
            )}
          </Box>
        )
      })}
    </SimpleGrid>
  )
}

function RelationItems({ names }: { names: string[] }) {
  if (names.length === 0) {
    return <Text size="sm" c="dimmed">なし</Text>
  }
  return (
    <Group gap={6}>
      {names.map((name) => <Badge key={name} variant="light">{name}</Badge>)}
    </Group>
  )
}

function MediaGrid() {
  const tones = ["blue", "grape", "teal", "orange", "cyan"]
  return (
    <SimpleGrid cols={{ base: 2, sm: 3, lg: 4, xl: 5 }} spacing="sm">
      {Array.from({ length: 24 }, (_, index) => (
        <Box
          key={index}
          bg={"var(--mantine-color-" + tones[index % tones.length] + "-1)"}
          bdrs="sm"
          style={{
            aspectRatio: "1 / 1",
            border: "1px solid var(--mantine-color-default-border)",
          }}
        />
      ))}
    </SimpleGrid>
  )
}

export function GroupBrowserPrototype() {
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const splitViewRef = useGroupRef()
  const [savedLayout, setSavedLayout] = useState({ groups: 40, detail: 60 })
  const [relationsOpened, relations] = useDisclosure(false)
  const compact = useMediaQuery("(max-width: 47.99em)")
  const [compactView, setCompactView] = useState<"groups" | "detail">("groups")

  const visibleGroups = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase()
    if (!normalized) return groups
    return groups.filter((group) =>
      group.name.toLocaleLowerCase().includes(normalized),
    )
  }, [query])

  const selected = groups.find((group) => group.id === selectedId) ?? null

  useEffect(() => {
    const stored = window.localStorage.getItem("memoria-group-browser-layout")
    if (!stored) return
    try {
      const layout = JSON.parse(stored) as { groups?: number; detail?: number }
      if (typeof layout.groups === "number" && typeof layout.detail === "number") {
        setSavedLayout({ groups: layout.groups, detail: layout.detail })
      }
    } catch {
      window.localStorage.removeItem("memoria-group-browser-layout")
    }
  }, [])

  const openDetail = (id: string) => {
    setSelectedId(id)
    if (compact) {
      setCompactView("detail")
      return
    }
    const layout = splitViewRef.current?.getLayout()
    if (layout?.detail === 0) {
      splitViewRef.current?.setLayout(savedLayout)
    }
  }

  const closeDetail = () => {
    setSelectedId(null)
    if (compact) {
      setCompactView("groups")
    }
  }

  const handleDetailExitComplete = () => {
    if (compact || selectedId) return
    splitViewRef.current?.setLayout({ groups: 100, detail: 0 })
  }

  const handleLayoutChanged = (
    layout: Record<string, number>,
    meta: { requestedLayout?: Record<string, number> },
  ) => {
    const requested = meta.requestedLayout ?? layout
    if (!selectedId || requested.detail === 0) return
    const next = { groups: requested.groups, detail: requested.detail }
    setSavedLayout(next)
    window.localStorage.setItem("memoria-group-browser-layout", JSON.stringify(next))
  }

  return (
    <ApplicationShell
      currentContext={personalContext}
      contexts={[personalContext]}
      navigationItems={applicationNavigation}
      user={{ displayName: "ユーザー" }}
      onSelectContext={() => undefined}
      onSelectNavigation={() => undefined}
      onOpenSettings={() => undefined}
      onLogout={() => undefined}
    >
      {compact ? (
        <Box h="calc(100vh - 88px)" style={{ overflow: "hidden" }}>
          {compactView === "groups" ? (
            <Box h="100%" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
              <Stack p="sm" gap="xs">
                <Group gap="xs" wrap="nowrap"><TextInput flex={1} value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Groupを検索" leftSection={<IconSearch size={16} />} /><ActionIcon variant="subtle" aria-label="Groupを作成"><IconPlus size={18} /></ActionIcon></Group>
                <Text size="xs" c="dimmed">{visibleGroups.length}件</Text>
              </Stack>
              <Divider />
              <ScrollArea flex={1}><Box p="sm" style={{ display: "flex", flexWrap: "wrap", gap: "var(--mantine-spacing-sm)" }}>{visibleGroups.map((group) => (
                <UnstyledButton key={group.id} onClick={() => openDetail(group.id)} p="xs" bdrs="sm" w={240}>
                  <Stack gap={6}><Text fw={600} size="sm" truncate="end" title={group.name}>{group.name}</Text><PreviewGrid count={group.previewCount} /></Stack>
                </UnstyledButton>
              ))}</Box></ScrollArea>
            </Box>
          ) : (
            <Box h="100%" style={{ display: "flex", flexDirection: "column" }}>
              <Group p="sm" justify="space-between" wrap="nowrap">
                <Box miw={0}><Text fw={700} truncate="end">{selected?.name ?? ""}</Text><Text size="xs" c="dimmed">{selected?.mediaCount ?? 0}件のMedia</Text></Box>
                <ActionIcon variant="subtle" aria-label="Group一覧に戻る" onClick={closeDetail}><IconX size={18} /></ActionIcon>
              </Group>
              <Divider />
              <ScrollArea flex={1}><Box p="sm">{(selected?.mediaCount ?? 0) === 0 ? <Paper withBorder p="xl" ta="center"><Text fw={600}>Mediaがありません</Text></Paper> : <MediaGrid />}</Box></ScrollArea>
            </Box>
          )}
        </Box>
      ) : (
      <SplitView.Root
        groupRef={splitViewRef}
        defaultLayout={{ groups: 100, detail: 0 }}
        onLayoutChanged={handleLayoutChanged}
        style={{ height: "calc(100vh - 88px)" }}
      >
        <SplitView.Pane id="groups" minWidth={264}>
          <Box style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
            <Stack p="sm" gap="xs">
              <Group gap="xs" wrap="nowrap">
                <TextInput
                  flex={1}
                  value={query}
                  onChange={(event) => setQuery(event.currentTarget.value)}
                  placeholder="Groupを検索"
                  leftSection={<IconSearch size={16} />}
                />
                <ActionIcon variant="subtle" aria-label="Groupを作成">
                  <IconPlus size={18} />
                </ActionIcon>
              </Group>
              <Text size="xs" c="dimmed">{visibleGroups.length}件</Text>
            </Stack>
            <Divider />
            <ScrollArea flex={1}>
              <Box p="sm" style={{ display: "flex", flexWrap: "wrap", gap: "var(--mantine-spacing-sm)" }}>
                {visibleGroups.map((group) => {
                  const selectedItem = group.id === selectedId
                  return (
                    <UnstyledButton
                      key={group.id}
                      onClick={() => openDetail(group.id)}
                      aria-pressed={selectedItem}
                      w={240}
                      p="xs"
                      bdrs="sm"
                      bg={selectedItem ? "var(--mantine-color-default-hover)" : undefined}
                      style={{
                        border: selectedItem
                          ? "1px solid var(--mantine-primary-color-filled)"
                          : "1px solid transparent",
                      }}
                    >
                      <Stack gap={6}>
                        <Text fw={600} size="sm" truncate="end" title={group.name}>{group.name}</Text>
                        <PreviewGrid count={group.previewCount} />
                      </Stack>
                    </UnstyledButton>
                  )
                })}
              </Box>
            </ScrollArea>
          </Box>
        </SplitView.Pane>

        <SplitView.Separator
          style={{ visibility: selectedId ? "visible" : "hidden" }}
        />

        <SplitView.Pane id="detail" minWidth={360} collapsible collapsedSize={0}>
          <AnimatePresence onExitComplete={handleDetailExitComplete}>
            {selectedId && (
            <motion.div
              style={{ height: "100%" }}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.3 }}
            >
          <Box style={{
            display: selectedId ? "flex" : "none", flexDirection: "column", minWidth: 0, minHeight: 0, height: "100%",
          }}>
            <Box p="sm">
              <Group justify="space-between" wrap="nowrap">
                <Box miw={0}>
                  <Text fw={700} truncate="end">{selected?.name ?? ""}</Text>
                  <Text size="xs" c="dimmed">{selected?.mediaCount ?? 0}件のMedia</Text>
                </Box>
                <Group gap="xs" wrap="nowrap">
                  <Button size="xs" variant="default">所属関係</Button>
                  <Menu position="bottom-end">
                    <Menu.Target>
                      <ActionIcon variant="subtle" aria-label="Groupの操作">
                        <IconDots size={18} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item leftSection={<IconEdit size={15} />}>名前を変更</Menu.Item>
                      <Menu.Item color="red" leftSection={<IconTrash size={15} />}>削除</Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                  <ActionIcon variant="subtle" aria-label="Groupの選択を解除" onClick={closeDetail}>
                    <IconX size={18} />
                  </ActionIcon>
                </Group>
              </Group>
            </Box>
            <Divider />

            <UnstyledButton onClick={relations.toggle} px="sm" py="xs">
              <Group gap="xs">
                {relationsOpened ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                <Text size="sm" fw={600}>このGroupとの関係</Text>
              </Group>
            </UnstyledButton>
            {relationsOpened && (
              <Box px="lg" pb="sm">
                <SimpleGrid cols={2} spacing="lg">
                  <Stack gap={4}>
                    <Text size="xs" c="dimmed">Parents</Text>
                    <RelationItems names={selected?.parentNames ?? []} />
                  </Stack>
                  <Stack gap={4}>
                    <Text size="xs" c="dimmed">Children</Text>
                    <RelationItems names={selected?.childNames ?? []} />
                  </Stack>
                </SimpleGrid>
              </Box>
            )}
            <Divider />

            <ScrollArea flex={1}>
              <Box p="sm">
                {(selected?.mediaCount ?? 0) === 0 ? (
                  <Paper withBorder p="xl" ta="center">
                    <Text fw={600}>Mediaがありません</Text>
                    <Text size="sm" c="dimmed" mt={4}>
                      このGroupまたはその下位Groupに分類されたMediaはありません。
                    </Text>
                  </Paper>
                ) : (
                  <MediaGrid />
                )}
              </Box>
            </ScrollArea>
          </Box>
            </motion.div>
            )}
          </AnimatePresence>
        </SplitView.Pane>
      </SplitView.Root>
      )}
    </ApplicationShell>
  )
}
