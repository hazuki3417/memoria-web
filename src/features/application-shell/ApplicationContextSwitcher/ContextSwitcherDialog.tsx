"use client"

import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Group,
  Modal,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  TextInput,
} from "@mantine/core"
import { IconCheck, IconPlus, IconSearch, IconX } from "@tabler/icons-react"
import type { ApplicationContextOption } from "../types"

type Props = {
  opened: boolean
  onClose: () => void
  currentContext: ApplicationContextOption
  contexts: ApplicationContextOption[]
  search: string
  onSearchChange: (value: string) => void
  onSelect: (id: string) => void
  onCreateCommunity?: () => void
  onRetry?: () => void
  loading: boolean
  error: boolean
}

export function ContextSwitcherDialog({
  opened,
  onClose,
  currentContext,
  contexts,
  search,
  onSearchChange,
  onSelect,
  onCreateCommunity,
  onRetry,
  loading,
  error,
}: Props) {
  const personal = contexts.find((item) => item.kind === "personal")
  const communities = contexts.filter((item) => item.kind === "community")
  const pinned = communities.find((item) => item.id === currentContext.id)
  const term = search.trim().toLocaleLowerCase("ja")
  const shown = communities.filter(
    (item) =>
      item.id !== pinned?.id &&
      item.label.toLocaleLowerCase("ja").includes(term),
  )
  const select = (id: string) => {
    onClose()
    onSelect(id)
  }
  // Accent Lineは選択状態とは独立して、各Contextの色を示す。
  const accent = (item: ApplicationContextOption) => (
    <Box
      pos="absolute"
      top={3}
      bottom={3}
      left={0}
      w={3}
      bg={item.accentColor}
      style={{
        borderRadius: "var(--mantine-radius-xl)",
        pointerEvents: "none",
      }}
      aria-hidden="true"
    />
  )

  const modalOption = (item: ApplicationContextOption) => (
    <Box key={item.id} pos="relative" pl={8}>
      {accent(item)}
      <NavLink
        label={item.label}
        onClick={() => select(item.id)}
        rightSection={
          item.id === currentContext.id ? <IconCheck size={14} /> : null
        }
        active={item.id === currentContext.id}
        variant="subtle"
        color="gray"
        styles={{
          root: {
            borderRadius: "var(--mantine-radius-sm)",
            background:
              item.id === currentContext.id
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
      rightSection={
        search ? (
          <ActionIcon
            size="xs"
            variant="subtle"
            color="gray"
            aria-label="検索をクリア"
            onClick={() => onSearchChange("")}
          >
            <IconX size={12} aria-hidden="true" />
          </ActionIcon>
        ) : undefined
      }
      rightSectionPointerEvents="all"
      value={search}
      onChange={(event) => onSearchChange(event.currentTarget.value)}
    />
  )

  const status = (
    <>
      {loading && communities.length === 0 && (
        <Text size="xs" c="dimmed" px="sm" py="xs" role="status">
          読み込み中です。
        </Text>
      )}
      {error && (
        <Group px="sm" py="xs" gap="xs" wrap="nowrap" justify="space-between">
          <Text size="xs" c="red" role="alert">
            取得できませんでした。
          </Text>
          {onRetry && (
            <Button
              size="compact-xs"
              variant="subtle"
              color="red"
              onClick={onRetry}
              style={{ flexShrink: 0 }}
            >
              再試行
            </Button>
          )}
        </Group>
      )}
      {!loading && !error && communities.length === 0 && (
        <Text size="xs" c="dimmed" px="sm" py="xs">
          参加中のCommunityはありません。
        </Text>
      )}
      {!loading && communities.length > 0 && shown.length === 0 && (
        <Text size="xs" c="dimmed" px="sm" py="xs">
          {term
            ? "一致するCommunityはありません。"
            : "他のCommunityはありません。"}
        </Text>
      )}
    </>
  )

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="切り替え先"
      centered
      size="sm"
    >
      <Stack gap={4}>
        {personal && modalOption(personal)}
        <Box
          mt={4}
          pt={4}
          style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}
        >
          {!error && pinned && modalOption(pinned)}
          {communities.length > 0 && (
            <Box px={8} py={4}>
              {searchInput}
            </Box>
          )}
          <ScrollArea.Autosize mah="50vh" type="auto">
            {status}
            {!error && shown.map(modalOption)}
          </ScrollArea.Autosize>
        </Box>
        {onCreateCommunity && (
          <>
            <Divider />
            <NavLink
              label="Communityを作成"
              leftSection={<IconPlus size={16} />}
              onClick={() => {
                onClose()
                onCreateCommunity()
              }}
            />
          </>
        )}
      </Stack>
    </Modal>
  )
}
