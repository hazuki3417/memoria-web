"use client"

import {
  Alert,
  Box,
  Button,
  Divider,
  Group,
  Loader,
  Modal,
  Popover,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import {
  IconCheck,
  IconPlus,
  IconSearch,
  IconUsers,
} from "@tabler/icons-react"
import { useState } from "react"
import type { ApplicationContextOption } from "../types"

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
  const constrained = useMediaQuery("(max-width: 48em)")
  const [opened, setOpened] = useState(false)
  const [search, setSearch] = useState("")

  const personal = contexts.find((item) => item.kind === "personal")
  const communities = contexts.filter((item) => item.kind === "community")
  const active = communities.find((item) => item.id === currentContext.id)
  const term = search.toLocaleLowerCase("ja").trim()
  const matches = communities.filter((item) =>
    item.label.toLocaleLowerCase("ja").includes(term),
  )
  // 候補の並び順はApplication Shell機能層で構築済み。
  const pinned = !term && active ? active : undefined
  const shown = !term && pinned
    ? matches.filter((item) => item.id !== pinned.id)
    : matches

  const open = () => {
    setOpened(true)
    onOpen?.()
  }
  const close = () => {
    setOpened(false)
    setSearch("")
  }
  const select = (id: string) => {
    close()
    onSelect(id)
  }

  const option = (context: ApplicationContextOption) => (
    <UnstyledButton
      key={context.id}
      onClick={() => select(context.id)}
      aria-current={context.id === currentContext.id ? "true" : undefined}
      w="100%"
      px="sm"
      py="xs"
      style={{ borderRadius: "var(--mantine-radius-sm)" }}
    >
      <Group gap="sm" wrap="nowrap">
        <Box
          w={12}
          h={12}
          style={{
            backgroundColor: context.accentColor,
            border: "1px solid var(--mantine-color-default-border)",
            borderRadius: "var(--mantine-radius-xs)",
            flexShrink: 0,
          }}
          aria-hidden="true"
        />
        <Text size="sm" style={{ flex: 1 }} lineClamp={2}>
          {context.label}
        </Text>
        {context.id === currentContext.id && (
          <IconCheck size={16} aria-label="選択中" />
        )}
      </Group>
    </UnstyledButton>
  )

  const contents = (
    <Stack gap="xs">
      <TextInput
        label="Communityを検索"
        placeholder="Community名"
        leftSection={<IconSearch size={16} aria-hidden="true" />}
        value={search}
        onChange={(event) => setSearch(event.currentTarget.value)}
      />
      {personal && option(personal)}
      {pinned && (
        <>
          <Divider />
          {option(pinned)}
        </>
      )}
      <Divider />
      <ScrollArea.Autosize mah="min(50vh, 360px)" type="auto">
        <Stack gap={2}>
          {loading && communities.length === 0 && <Loader size="sm" />}
          {error && (
            <Alert color="red" title="Community一覧を取得できませんでした">
              <Stack gap="xs">
                <Text size="sm">
                  {communities.length > 0
                    ? "取得済みの一覧を表示しています。"
                    : "再試行するかPersonalへ切り替えてください。"}
                </Text>
                {onRetry && (
                  <Button variant="outline" size="xs" onClick={onRetry}>
                    再試行
                  </Button>
                )}
              </Stack>
            </Alert>
          )}
          {!loading && !error && communities.length === 0 && (
            <Text c="dimmed" size="sm">参加中のCommunityはありません。</Text>
          )}
          {!loading && communities.length > 0 && shown.length === 0 && (
            <Text c="dimmed" size="sm">
              {term ? "一致するCommunityはありません。" : "他のCommunityはありません。"}
            </Text>
          )}
          {shown.map(option)}
        </Stack>
      </ScrollArea.Autosize>
      {onCreateCommunity && (
        <>
          <Divider />
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconPlus size={16} />}
            onClick={() => {
              close()
              onCreateCommunity()
            }}
            justify="flex-start"
          >
            Communityを作成
          </Button>
        </>
      )}
    </Stack>
  )

  const trigger = (
    <Button
      variant="subtle"
      color="gray"
      size="compact-sm"
      px="xs"
      aria-label="コンテキストを切り替える"
      aria-expanded={opened}
      onClick={opened ? close : open}
      maw={{ base: 144, sm: 240 }}
    >
      <Text size="xs" mr={6} aria-hidden="true">▾</Text>
      <Text size="sm" truncate>{currentContext.label}</Text>
    </Button>
  )

  return (
    <>
      <Popover
        opened={opened && !constrained}
        onChange={(next) => {
          if (!next) close()
        }}
        withinPortal
        position="bottom-start"
        width={360}
        middlewares={{ shift: true, flip: true }}
      >
        <Popover.Target>{trigger}</Popover.Target>
        <Popover.Dropdown maw="calc(100vw - 24px)">
          <Group gap={6} mb="sm" wrap="nowrap">
            <IconUsers size={14} stroke={1.6} aria-hidden="true" />
            <Text size="xs">切り替え先</Text>
          </Group>
          {contents}
        </Popover.Dropdown>
      </Popover>
      <Modal
        opened={opened && !!constrained}
        onClose={close}
        title="利用範囲を切り替える"
        centered
        size="sm"
      >
        {contents}
      </Modal>
    </>
  )
}
