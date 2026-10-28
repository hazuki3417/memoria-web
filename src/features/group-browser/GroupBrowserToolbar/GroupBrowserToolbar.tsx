"use client"

import type { Ref } from "react"
import { Box, Button, Group, TextInput } from "@mantine/core"
import { IconFolderPlus, IconSearch } from "@tabler/icons-react"

type GroupBrowserToolbarProps = {
  compact: boolean
  query: string
  onQueryChange: (query: string) => void
  onSearch: () => void
  searchRef?: Ref<HTMLInputElement>
  hideManagementActions: boolean
  canManage: boolean
  onCreate: () => void
}

export function GroupBrowserToolbar({
  compact,
  query,
  onQueryChange,
  onSearch,
  searchRef,
  hideManagementActions,
  canManage,
  onCreate,
}: GroupBrowserToolbarProps) {
  return (
    <Box
      pb="xs"
      style={{
        display: "grid",
        gridTemplateColumns: compact ? "minmax(0, 1fr)" : "minmax(0, 1fr) auto",
        alignItems: "center",
        minHeight: "calc(32px + var(--mantine-spacing-xs))",
        gap: "var(--mantine-spacing-xs)",
      }}
    >
      <Box style={{ minWidth: 0 }}>
        <Group
          component="form"
          onSubmit={(event) => {
            event.preventDefault()
            onSearch()
          }}
          gap="xs"
          wrap="nowrap"
          style={{ minWidth: 0 }}
        >
          <TextInput
            w={compact ? "100%" : 280}
            maw="100%"
            size="xs"
            ref={searchRef}
            value={query}
            maxLength={255}
            onChange={(event) => onQueryChange(event.currentTarget.value)}
            placeholder="Groupを検索"
            leftSection={<IconSearch size={16} />}
            style={{ flex: compact ? "1 1 auto" : undefined }}
          />
          <Button size="xs" type="submit">
            検索
          </Button>
        </Group>
      </Box>
      <Group
        gap="xs"
        wrap="nowrap"
        justify="flex-end"
        style={{ gridColumn: compact ? "1" : undefined }}
      >
        {!hideManagementActions && (
          <Button
            size="xs"
            leftSection={<IconFolderPlus size={16} />}
            onClick={onCreate}
            disabled={!canManage}
          >
            Groupを作成
          </Button>
        )}
      </Group>
    </Box>
  )
}
