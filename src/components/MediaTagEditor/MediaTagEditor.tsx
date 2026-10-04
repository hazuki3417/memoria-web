"use client"

import { Box, Button, Checkbox, Divider, Group, Paper, Stack, TagsInput, Text } from "@mantine/core"
import { IconPhoto } from "@tabler/icons-react"
import { type ReactNode, useState } from "react"

export type MediaTagEditorItem = {
  id: string
  tags: string[]
  label?: string
  selectable?: boolean
  tagEditable?: boolean
  supplementary?: ReactNode
  actions?: ReactNode
}

export function MediaTagEditor({
  items,
  selectedIds,
  onSelectedIdsChange,
  onTagsChange,
}: {
  items: MediaTagEditorItem[]
  selectedIds: string[]
  onSelectedIdsChange: (ids: string[]) => void
  onTagsChange: (id: string, tags: string[]) => void
}) {
  const [bulkTag, setBulkTag] = useState("")
  const selectableItems = items.filter((item) => item.selectable !== false)
  const allSelected = selectableItems.length > 0 && selectableItems.every((item) => selectedIds.includes(item.id))

  const apply = (action: "add" | "remove") => {
    const tag = bulkTag.trim()
    if (!tag) return
    for (const item of selectableItems) {
      if (!selectedIds.includes(item.id) || item.tagEditable === false) continue
      const tags = action === "add"
        ? item.tags.includes(tag) ? item.tags : [...item.tags, tag]
        : item.tags.filter((value) => value !== tag)
      onTagsChange(item.id, tags)
    }
    setBulkTag("")
  }

  const toggleAll = () => onSelectedIdsChange(
    allSelected ? selectedIds.filter((id) => !selectableItems.some((item) => item.id === id)) : [...new Set([...selectedIds, ...selectableItems.map((item) => item.id)])],
  )

  return (
    <Stack gap="sm">
      <Paper withBorder radius="md" p="sm">
        <Group wrap="nowrap">
          <Checkbox
            checked={allSelected}
            indeterminate={selectableItems.some((item) => selectedIds.includes(item.id)) && !allSelected}
            disabled={selectableItems.length === 0}
            onChange={toggleAll}
            aria-label="編集可能なMediaをすべて選択"
          />
          <Text size="sm" fw={600} w={72}>{selectedIds.length}件選択</Text>
          <Divider orientation="vertical" />
          <TagsInput
            style={{ flex: 1 }}
            value={bulkTag ? [bulkTag] : []}
            onChange={(tags) => setBulkTag(tags.at(-1) ?? "")}
            placeholder="選択したMediaの共通Tag"
            maxTags={1}
            disabled={selectableItems.length === 0}
          />
          <Button variant="default" disabled={!bulkTag.trim() || selectedIds.length === 0} onClick={() => apply("add")}>追加</Button>
          <Button variant="default" disabled={!bulkTag.trim() || selectedIds.length === 0} onClick={() => apply("remove")}>除去</Button>
        </Group>
      </Paper>

      {items.length > 0 && (
        <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
          {items.map((item, index) => {
            const selectable = item.selectable !== false
            const tagEditable = item.tagEditable !== false
            return (
              <Box key={item.id}>
                {index > 0 && <Divider />}
                <Group p="sm" wrap="nowrap" align="center">
                  <Checkbox
                    checked={selectedIds.includes(item.id)}
                    disabled={!selectable}
                    onChange={(event) => onSelectedIdsChange(
                      event.currentTarget.checked
                        ? [...new Set([...selectedIds, item.id])]
                        : selectedIds.filter((id) => id !== item.id),
                    )}
                    aria-label={`${item.label ?? "Media"}を選択`}
                  />
                  <Box w={72} h={72} style={{ flex: "0 0 auto", borderRadius: "var(--mantine-radius-sm)", background: "var(--mantine-color-default-hover)", display: "grid", placeItems: "center" }}>
                    <IconPhoto size={28} stroke={1.4} />
                  </Box>
                  <Stack gap={4} w={180} style={{ flexShrink: 0, minWidth: 0 }}>
                    {item.label && <Text size="sm" fw={600} truncate>{item.label}</Text>}
                    {item.supplementary}
                  </Stack>
                  <TagsInput
                    style={{ flex: 1 }}
                    value={item.tags}
                    onChange={(tags) => onTagsChange(item.id, tags)}
                    placeholder="Tagを追加"
                    disabled={!tagEditable}
                  />
                  {item.actions}
                </Group>
              </Box>
            )
          })}
        </Paper>
      )}
    </Stack>
  )
}
