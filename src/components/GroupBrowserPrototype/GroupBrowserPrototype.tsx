"use client"

import {
  ActionIcon, Badge, Box, Button, Divider, Group, Menu, Paper, ScrollArea,
  SimpleGrid, Stack, Text, TextInput, UnstyledButton,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import {
  IconChevronDown, IconChevronRight, IconDots, IconEdit, IconPlus,
  IconLayoutDashboard, IconPhoto, IconSearch, IconTrash, IconUsers, IconX,
} from "@tabler/icons-react"
import { useMemo, useState } from "react"
import { ApplicationShell } from "@/components/ApplicationShell"
import { SplitView } from "@/components/SplitView"

type PrototypeGroup = {
  id: string
  name: string
  mediaCount: number
  previewCount: number
}

const groups: PrototypeGroup[] = [
  { id: "travel", name: "旅行", mediaCount: 128, previewCount: 8 },
  { id: "family", name: "家族", mediaCount: 84, previewCount: 8 },
  { id: "food", name: "料理", mediaCount: 42, previewCount: 6 },
  { id: "landscape", name: "風景写真", mediaCount: 31, previewCount: 7 },
  { id: "archive", name: "あとで整理する写真", mediaCount: 18, previewCount: 2 },
  { id: "empty", name: "新しいGroup", mediaCount: 0, previewCount: 0 },
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

const previewTones = [
  "var(--mantine-color-blue-1)",
  "var(--mantine-color-grape-1)",
  "var(--mantine-color-teal-1)",
  "var(--mantine-color-orange-1)",
  "var(--mantine-color-cyan-1)",
  "var(--mantine-color-indigo-1)",
  "var(--mantine-color-lime-1)",
  "var(--mantine-color-pink-1)",
]

function PreviewStrip({ count }: { count: number }) {
  return (
    <Box
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(44px, 1fr))",
        gridAutoRows: "1fr",
        gap: 4,
        maxHeight: 96,
        overflow: "hidden",
      }}
    >
      {Array.from({ length: Math.min(count, 8) }, (_, index) => (
        <Box
          key={index}
          bdrs="sm"
          bg={previewTones[index]}
          style={{
            aspectRatio: "1 / 1",
            border: "1px solid var(--mantine-color-default-border)",
          }}
        />
      ))}
    </Box>
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
  const [selectedId, setSelectedId] = useState("travel")
  const [relationsOpened, relations] = useDisclosure(false)

  const visibleGroups = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase()
    if (!normalized) return groups
    return groups.filter((group) =>
      group.name.toLocaleLowerCase().includes(normalized),
    )
  }, [query])

  const selected = groups.find((group) => group.id === selectedId) ?? groups[0]

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
      <SplitView.Root
        defaultLayout={{ groups: 32, detail: 68 }}
        style={{ height: "calc(100vh - 88px)" }}
      >
        <SplitView.Pane id="groups" minSize={24}>
          <Box style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
            <Stack p="sm" gap="xs">
              <Group justify="space-between">
                <Text fw={700}>Groups</Text>
                <ActionIcon variant="subtle" aria-label="Groupを作成">
                  <IconPlus size={18} />
                </ActionIcon>
              </Group>
              <TextInput
                value={query}
                onChange={(event) => setQuery(event.currentTarget.value)}
                placeholder="Groupを検索"
                leftSection={<IconSearch size={16} />}
              />
              <Text size="xs" c="dimmed">{visibleGroups.length} Groups</Text>
            </Stack>
            <Divider />
            <ScrollArea flex={1}>
              <Stack p="sm" gap="xs">
                {visibleGroups.map((group) => {
                  const selectedItem = group.id === selectedId
                  return (
                    <UnstyledButton
                      key={group.id}
                      onClick={() => setSelectedId(group.id)}
                      aria-pressed={selectedItem}
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
                        <Text fw={600} size="sm" truncate="end">{group.name}</Text>
                        <PreviewStrip count={group.previewCount} />
                      </Stack>
                    </UnstyledButton>
                  )
                })}
              </Stack>
            </ScrollArea>
          </Box>
        </SplitView.Pane>

        <SplitView.Separator />

        <SplitView.Pane id="detail" minSize={40}>
          <Box style={{
            display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0, height: "100%",
          }}>
            <Box p="sm">
              <Group justify="space-between" wrap="nowrap">
                <Box miw={0}>
                  <Text fw={700} truncate="end">{selected.name}</Text>
                  <Text size="xs" c="dimmed">{selected.mediaCount} Media</Text>
                </Box>
                <Group gap="xs" wrap="nowrap">
                  <Button size="xs" variant="default">Relations</Button>
                  <Menu position="bottom-end">
                    <Menu.Target>
                      <ActionIcon variant="subtle" aria-label="Groupの操作">
                        <IconDots size={18} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item leftSection={<IconEdit size={15} />}>Rename</Menu.Item>
                      <Menu.Item color="red" leftSection={<IconTrash size={15} />}>Delete</Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                  <ActionIcon variant="subtle" aria-label="Group選択を閉じる">
                    <IconX size={18} />
                  </ActionIcon>
                </Group>
              </Group>
            </Box>
            <Divider />

            <UnstyledButton onClick={relations.toggle} px="sm" py="xs">
              <Group gap="xs">
                {relationsOpened ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                <Text size="sm" fw={600}>Related groups</Text>
              </Group>
            </UnstyledButton>
            {relationsOpened && (
              <Box px="lg" pb="sm">
                <SimpleGrid cols={2} spacing="lg">
                  <Stack gap={4}>
                    <Text size="xs" c="dimmed">Parents</Text>
                    <Group gap={6}>
                      <Badge variant="light">旅行</Badge>
                      <Badge variant="light">2026</Badge>
                    </Group>
                  </Stack>
                  <Stack gap={4}>
                    <Text size="xs" c="dimmed">Children</Text>
                    <Group gap={6}>
                      <Badge variant="light">北海道</Badge>
                      <Badge variant="light">東北</Badge>
                      <Badge variant="light">関東</Badge>
                    </Group>
                  </Stack>
                </SimpleGrid>
              </Box>
            )}
            <Divider />

            <ScrollArea flex={1}>
              <Box p="sm">
                {selected.mediaCount === 0 ? (
                  <Paper withBorder p="xl" ta="center">
                    <Text fw={600}>表示するMediaがありません</Text>
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
        </SplitView.Pane>
      </SplitView.Root>
    </ApplicationShell>
  )
}
