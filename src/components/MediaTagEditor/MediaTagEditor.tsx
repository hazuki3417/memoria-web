"use client"

import { Box, Button, Checkbox, Divider, Group, Paper, Stack, TagsInput, Text, TextInput } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { IconPhoto } from "@tabler/icons-react"
import type { ReactNode } from "react"

export type MediaTagEditorItem = {
  id: string
  tags: string[]
  label: string
  detail?: string
  selectable?: boolean
  tagEditable?: boolean
  supplementary?: ReactNode
  actions?: ReactNode
}

export type MediaTagEditorSummaryItem = {
  label: string
  value: string
}

export function MediaTagEditor({
  items,
  selectedIds,
  bulkTag,
  summaryItems = [],
  bulkTagPlaceholder = "選択したMediaのTag",
  selectAllLabel = "編集可能なMediaをすべて選択",
  headerAction,
  onSelectedIdsChange,
  onBulkTagChange,
  onBulkTagAction,
  onTagsChange,
}: {
  items: MediaTagEditorItem[]
  selectedIds: string[]
  bulkTag: string
  summaryItems?: MediaTagEditorSummaryItem[]
  bulkTagPlaceholder?: string
  selectAllLabel?: string
  headerAction?: ReactNode
  onSelectedIdsChange: (ids: string[]) => void
  onBulkTagChange: (value: string) => void
  onBulkTagAction: (action: "add" | "remove" | "replace") => void
  onTagsChange: (id: string, tags: string[]) => void
}) {
  const compact = useMediaQuery("(max-width: 48em)")
  const selectableItems = items.filter((item) => item.selectable !== false)
  const selectedSelectableIds = selectableItems.filter((item) => selectedIds.includes(item.id)).map((item) => item.id)
  const allSelected = selectableItems.length > 0 && selectedSelectableIds.length === selectableItems.length
  const bulkDisabled = items.length > 0 && selectableItems.length === 0
  const actionDisabled = items.length === 0 || !bulkTag.trim() || selectedSelectableIds.length === 0

  const toggleAll = () => onSelectedIdsChange(allSelected ? [] : selectableItems.map((item) => item.id))

  return (
    <Stack gap="sm">
      <Paper withBorder radius="md" p="sm">
        {compact ? (
          <Stack gap="sm">
            <Group justify="space-between" wrap="nowrap">
              <Group gap="sm" wrap="nowrap">
                <Checkbox
                  checked={allSelected}
                  indeterminate={selectedSelectableIds.length > 0 && !allSelected}
                  onChange={toggleAll}
                  disabled={selectableItems.length === 0}
                  aria-label={selectAllLabel}
                />
                <Text size="sm" fw={600}>{selectedSelectableIds.length}件選択</Text>
              </Group>
              {headerAction}
            </Group>
            {summaryItems.length > 0 && (
              <Group gap="lg">
                <Stack gap={0}>{summaryItems.map((item) => <Text key={item.label} size="xs" c="dimmed">{item.label}</Text>)}</Stack>
                <Stack gap={0}>{summaryItems.map((item) => <Text key={item.label} size="xs" c="dimmed">{item.value}</Text>)}</Stack>
              </Group>
            )}
            <TextInput value={bulkTag} onChange={(event) => onBulkTagChange(event.currentTarget.value)} disabled={bulkDisabled} placeholder={bulkTagPlaceholder} />
          </Stack>
        ) : (
          <Group align="center" wrap="nowrap" gap="md">
            <Checkbox
              checked={allSelected}
              indeterminate={selectedSelectableIds.length > 0 && !allSelected}
              onChange={toggleAll}
              disabled={selectableItems.length === 0}
              aria-label={selectAllLabel}
            />
            <Box w={72} style={{ flex: "0 0 72px" }}>
              <Text size="sm" fw={600}>{selectedSelectableIds.length}件選択</Text>
            </Box>
            {summaryItems.length > 0 && <Divider orientation="vertical" />}
            {summaryItems.length > 0 && (
              <Stack gap={0} style={{ flex: "0 0 22%", minWidth: 180 }}>
                {summaryItems.map((item) => (
                  <Group key={item.label} gap="xs" wrap="nowrap">
                    <Text size="xs" c="dimmed" w={88}>{item.label}</Text>
                    <Text size="xs" c="dimmed">{item.value}</Text>
                  </Group>
                ))}
              </Stack>
            )}
            <Divider orientation="vertical" />
            <TextInput style={{ flex: 1 }} value={bulkTag} onChange={(event) => onBulkTagChange(event.currentTarget.value)} disabled={bulkDisabled} placeholder={bulkTagPlaceholder} />
            {headerAction && <Box w={36} style={{ flex: "0 0 36px" }}>{headerAction}</Box>}
          </Group>
        )}
      </Paper>

      <Group justify="center" gap="xs">
        <Button variant="default" size="sm" disabled={actionDisabled} onClick={() => onBulkTagAction("add")}>追加</Button>
        <Button variant="default" size="sm" disabled={actionDisabled} onClick={() => onBulkTagAction("remove")}>除去</Button>
        <Button variant="default" size="sm" disabled={actionDisabled} onClick={() => onBulkTagAction("replace")}>置換</Button>
      </Group>

      {items.length > 0 && (
        <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
          {items.map((item, index) => (
            <Box key={item.id}>
              {index > 0 && <Divider />}
              <MediaTagEditorRow
                item={item}
                compact={compact}
                selected={selectedIds.includes(item.id)}
                onSelect={(checked) => onSelectedIdsChange(
                  checked ? [...new Set([...selectedIds, item.id])] : selectedIds.filter((id) => id !== item.id),
                )}
                onTagsChange={(tags) => onTagsChange(item.id, tags)}
              />
            </Box>
          ))}
        </Paper>
      )}
    </Stack>
  )
}

function MediaTagEditorRow({
  item,
  compact,
  selected,
  onSelect,
  onTagsChange,
}: {
  item: MediaTagEditorItem
  compact: boolean
  selected: boolean
  onSelect: (checked: boolean) => void
  onTagsChange: (tags: string[]) => void
}) {
  const selectable = item.selectable !== false
  const tagEditable = item.tagEditable !== false
  const mediaInfo = (
    <>
      <Text size="sm" fw={600} truncate>{item.label}</Text>
      {item.detail && <Text size="xs" c="dimmed">{item.detail}</Text>}
    </>
  )

  if (compact) {
    return (
      <Box p="sm">
        <Group align="center" wrap="nowrap" h={72}>
          <Checkbox checked={selected} disabled={!selectable} onChange={(event) => onSelect(event.currentTarget.checked)} aria-label={`${item.label}を選択`} />
          <Box w={72} h={72} style={{ flex: "0 0 auto", borderRadius: "var(--mantine-radius-sm)", background: "var(--mantine-color-default-hover)", display: "grid", placeItems: "center", overflow: "hidden" }}><IconPhoto size={22} stroke={1.4} /></Box>
          <Stack gap={4} justify="center" h={72} style={{ flex: "0 0 28%", minWidth: 0, overflow: "hidden" }}>
            <Box style={{ minWidth: 0 }}>{mediaInfo}</Box>
            {item.supplementary}
          </Stack>
          <Box h={72} style={{ flex: 1, minWidth: 0 }}>
            <TagsInput value={item.tags} onChange={onTagsChange} disabled={!tagEditable} size="xs" placeholder="Tagを追加" styles={{ root: { height: "100%" }, wrapper: { height: "100%" }, input: { minHeight: "72px", height: "72px", alignContent: "flex-start", paddingTop: "8px", paddingBottom: "8px" } }} />
          </Box>
          <Box w={28} style={{ flex: "0 0 28px" }}>{item.actions}</Box>
        </Group>
      </Box>
    )
  }

  return (
    <Box p="sm">
      <Group align="center" wrap="nowrap" gap="md" h={72}>
        <Checkbox checked={selected} disabled={!selectable} onChange={(event) => onSelect(event.currentTarget.checked)} aria-label={`${item.label}を選択`} />
        <Group align="center" wrap="nowrap" gap="sm" h={72} style={{ flex: "0 0 36%", minWidth: 0, overflow: "hidden" }}>
          <Box w={72} h={72} style={{ flex: "0 0 auto", borderRadius: "var(--mantine-radius-sm)", background: "var(--mantine-color-default-hover)", display: "grid", placeItems: "center", overflow: "hidden" }}><IconPhoto size={28} stroke={1.4} /></Box>
          <Stack gap={4} justify="center" h={72} style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
            <Box style={{ minWidth: 0 }}>{mediaInfo}</Box>
            {item.supplementary}
          </Stack>
        </Group>
        <Box h={72} style={{ flex: "1 1 54%", minWidth: 420 }}>
          <TagsInput value={item.tags} onChange={onTagsChange} disabled={!tagEditable} size="sm" placeholder="Tagを追加" styles={{ root: { height: "100%" }, wrapper: { height: "100%" }, input: { minHeight: "72px", height: "72px", alignContent: "flex-start", paddingTop: "8px", paddingBottom: "8px" } }} />
        </Box>
        <Box w={36} style={{ flex: "0 0 36px" }}>{item.actions}</Box>
      </Group>
    </Box>
  )
}
