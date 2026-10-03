"use client"

import {
  ActionIcon, Badge, Box, Button, Divider, Group, Menu, Paper, ScrollArea,
  SimpleGrid, Stack, Text, TextInput, Title, UnstyledButton,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import {
  IconChevronDown, IconChevronRight, IconDots, IconEdit, IconPlus,
  IconSearch, IconTrash, IconX,
} from "@tabler/icons-react"
import { useMemo, useState } from "react"

type PrototypeGroup = {
  id: string
  name: string
  mediaCount: number
  previewCount: number
}

const groups: PrototypeGroup[] = [
  { id: "travel", name: "旅行", mediaCount: 128, previewCount: 4 },
  { id: "family", name: "家族", mediaCount: 84, previewCount: 4 },
  { id: "food", name: "料理", mediaCount: 42, previewCount: 3 },
  { id: "landscape", name: "風景写真", mediaCount: 31, previewCount: 4 },
  { id: "archive", name: "あとで整理する写真", mediaCount: 18, previewCount: 2 },
  { id: "empty", name: "新しいGroup", mediaCount: 0, previewCount: 0 },
]

const previewTones = [
  "var(--mantine-color-blue-1)",
  "var(--mantine-color-grape-1)",
  "var(--mantine-color-teal-1)",
  "var(--mantine-color-orange-1)",
]

function PreviewStrip({ count }: { count: number }) {
  return (
    <SimpleGrid cols={4} spacing={4}>
      {Array.from({ length: 4 }, (_, index) => (
        <Box
          key={index}
          h={44}
          bdrs="sm"
          bg={index < count ? previewTones[index] : "var(--mantine-color-default-hover)"}
          style={{ border: "1px solid var(--mantine-color-default-border)" }}
        />
      ))}
    </SimpleGrid>
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
    <Box h="100vh" bg="var(--mantine-color-body)" p="md">
      <Stack h="100%" gap="sm">
        <Title order={1} size="h3">Groups</Title>

        <Box
          style={{
            display: "grid",
            gridTemplateColumns: "300px minmax(0, 1fr)",
            minHeight: 0,
            flex: 1,
            border: "1px solid var(--mantine-color-default-border)",
            borderRadius: "var(--mantine-radius-md)",
            overflow: "hidden",
          }}
        >
          <Box style={{
            display: "flex", flexDirection: "column", minHeight: 0,
            borderRight: "1px solid var(--mantine-color-default-border)",
          }}>
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
                        <PreviewStrip count={group.previewCount} />
                        <Text fw={600} size="sm" truncate="end">{group.name}</Text>
                      </Stack>
                    </UnstyledButton>
                  )
                })}
              </Stack>
            </ScrollArea>
          </Box>

          <Box style={{
            display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0,
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
        </Box>
      </Stack>
    </Box>
  )
}
