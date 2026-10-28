"use client"

import {
  Alert,
  Box,
  Button,
  Center,
  Divider,
  Group,
  Loader,
  Menu,
  Modal,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  TextInput,
} from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { IconCheck, IconPlus, IconSearch, IconUsers } from "@tabler/icons-react"
import { useState } from "react"
import type { ApplicationContextOption } from "../types"

const menuStyles = {
  dropdown: {
    border: "1px solid var(--mantine-color-default-border)",
    borderRadius: "var(--mantine-radius-md)",
    boxShadow: "var(--mantine-shadow-md)",
    padding: 4,
    minWidth: 200,
  },
  item: {
    borderRadius: "var(--mantine-radius-sm)",
    fontSize: "var(--mantine-font-size-sm)",
    minHeight: 32,
    padding: "5px 8px",
  },
  label: { padding: "8px 8px 4px", fontSize: "var(--mantine-font-size-xs)" },
} as const

export function ApplicationContextSwitcher({
  currentContext,
  contexts,
  onSelect,
  onCreateCommunity,
  onOpen,
  onRetry,
  loading = false,
  error = false,
}: {
  currentContext: ApplicationContextOption
  contexts: ApplicationContextOption[]
  onSelect: (contextId: string) => void
  onCreateCommunity?: () => void
  onOpen?: () => void
  onRetry?: () => void
  loading?: boolean
  error?: boolean
}) {
  const compact = useMediaQuery("(max-width: 48em)")
  const [opened, setOpened] = useState(false)
  const [search, setSearch] = useState("")

  const personal = contexts.find((item) => item.kind === "personal")
  const communities = contexts.filter((item) => item.kind === "community")
  const currentCommunity = communities.find((item) => item.id === currentContext.id)
  const term = search.trim().toLocaleLowerCase("ja")
  const matching = communities.filter((item) =>
    item.label.toLocaleLowerCase("ja").includes(term),
  )
  const pinned = !term ? currentCommunity : undefined
  const shown = pinned
    ? matching.filter((item) => item.id !== pinned.id)
    : matching

  const changeOpened = (next: boolean) => {
    if (next && !opened) onOpen?.()
    setOpened(next)
    if (!next) setSearch("")
  }
  const select = (id: string) => {
    changeOpened(false)
    onSelect(id)
  }

  // NavigationItemと同様、選択状態は左側のAccent Lineで示す。
  const accent = (item: ApplicationContextOption) =>
    item.id === currentContext.id ? (
      <Box
        pos="absolute"
        top={3}
        bottom={3}
        left={0}
        w={3}
        bg={item.accentColor}
        style={{ borderRadius: "var(--mantine-radius-xl)", pointerEvents: "none" }}
        aria-hidden="true"
      />
    ) : null

  const menuOption = (item: ApplicationContextOption) => (
    <Box key={item.id} pos="relative" pl={8}>
      {accent(item)}
      <Menu.Item
        onClick={() => select(item.id)}
        rightSection={item.id === currentContext.id ? <IconCheck size={14} /> : null}
        style={{
          background: item.id === currentContext.id
            ? "var(--mantine-color-default-hover)"
            : undefined,
          fontWeight: item.id === currentContext.id ? 600 : 400,
        }}
      >
        {item.label}
      </Menu.Item>
    </Box>
  )

  const modalOption = (item: ApplicationContextOption) => (
    <Box key={item.id} pos="relative" pl={8}>
      {accent(item)}
      <NavLink
        label={item.label}
        onClick={() => select(item.id)}
        rightSection={item.id === currentContext.id ? <IconCheck size={14} /> : null}
        active={item.id === currentContext.id}
        variant="subtle"
        color="gray"
        styles={{
          root: {
            borderRadius: "var(--mantine-radius-sm)",
            background: item.id === currentContext.id
              ? "var(--mantine-color-default-hover)"
              : undefined,
            padding: "5px 8px",
            minHeight: 32,
          },
          label: { fontSize: "var(--mantine-font-size-sm)" },
        }}
      />
    </Box>
  )

  const searchInput = (
    <TextInput
      aria-label="Communityを検索"
      placeholder="Communityを検索"
      size="xs"
      leftSection={<IconSearch size={14} aria-hidden="true" />}
      value={search}
      onChange={(event) => setSearch(event.currentTarget.value)}
    />
  )

  const status = (
    <>
      {loading && communities.length === 0 && (
        <Center w="100%" mih={64}>
          <Loader size="sm" aria-label="Community一覧を読み込み中" />
        </Center>
      )}
      {error && (
        <Alert color="red" title="Community一覧を取得できませんでした">
          <Text size="sm">
            {communities.length > 0
              ? "取得済みの一覧を表示しています。"
              : "再試行するかPersonalへ切り替えてください。"}
          </Text>
          {onRetry && (
            <Button size="xs" variant="outline" mt="xs" onClick={onRetry}>
              再試行
            </Button>
          )}
        </Alert>
      )}
      {!loading && !error && communities.length === 0 && (
        <Text size="xs" c="dimmed" px="sm" py="xs">
          参加中のCommunityはありません。
        </Text>
      )}
      {!loading && communities.length > 0 && shown.length === 0 && (
        <Text size="xs" c="dimmed" px="sm" py="xs">
          {term ? "一致するCommunityはありません。" : "他のCommunityはありません。"}
        </Text>
      )}
    </>
  )

  const trigger = (
    <Button
      variant="subtle"
      color="gray"
      size="compact-sm"
      px="xs"
      aria-label="コンテキストを切り替える"
      maw={{ base: 144, sm: 240 }}
      onClick={compact ? () => changeOpened(true) : undefined}
    >
      <Text size="xs" mr={6} aria-hidden="true">▾</Text>
      <Text size="sm" truncate>{currentContext.label}</Text>
    </Button>
  )

  return (
    <>
      <Menu
        opened={opened && !compact}
        onChange={changeOpened}
        withinPortal
        position="bottom-start"
        styles={menuStyles}
        width={280}
        closeOnItemClick={false}
      >
        <Menu.Target>{trigger}</Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>
            <Group gap={6} wrap="nowrap">
              <IconUsers size={14} stroke={1.6} aria-hidden="true" />
              <Text size="xs">切り替え先</Text>
            </Group>
          </Menu.Label>
          {personal && menuOption(personal)}
          <Box px={8} py={4}>{searchInput}</Box>
          {pinned && menuOption(pinned)}
          <ScrollArea.Autosize mah={360} type="auto">
            {status}
            {shown.map(menuOption)}
          </ScrollArea.Autosize>
          {onCreateCommunity && (
            <>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconPlus size={16} stroke={1.6} aria-hidden="true" />}
                onClick={() => {
                  changeOpened(false)
                  onCreateCommunity()
                }}
              >
                Communityを作成
              </Menu.Item>
            </>
          )}
        </Menu.Dropdown>
      </Menu>
      <Modal
        opened={opened && !!compact}
        onClose={() => changeOpened(false)}
        title="切り替え先"
        centered
        size="sm"
      >
        <Stack gap={4}>
          {personal && modalOption(personal)}
          <Box px={8} py={4}>{searchInput}</Box>
          {pinned && modalOption(pinned)}
          <ScrollArea.Autosize mah="50vh" type="auto">
            {status}
            {shown.map(modalOption)}
          </ScrollArea.Autosize>
          {onCreateCommunity && (
            <>
              <Divider />
              <NavLink
                label="Communityを作成"
                leftSection={<IconPlus size={16} />}
                onClick={() => {
                  changeOpened(false)
                  onCreateCommunity()
                }}
              />
            </>
          )}
        </Stack>
      </Modal>
    </>
  )
}
