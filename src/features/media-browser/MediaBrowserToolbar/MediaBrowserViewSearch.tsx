"use client"

import { Button, Group, TagsInput } from "@mantine/core"
import { IconSearch } from "@tabler/icons-react"

type MediaBrowserViewSearchProps = {
  compact: boolean
  tags: string[]
  onTagsChange: (tags: string[]) => void
  onSubmitTags: () => void
  tagOptions?: string[]
}

export function MediaBrowserViewSearch({
  compact,
  tags,
  onTagsChange,
  onSubmitTags,
  tagOptions,
}: MediaBrowserViewSearchProps) {
  return (
    <Group
      component="form"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmitTags()
      }}
      gap="xs"
      wrap="nowrap"
      style={{ minWidth: 0 }}
    >
      <TagsInput
        placeholder="Tagを検索"
        value={tags}
        onChange={onTagsChange}
        data={tagOptions}
        clearable
        leftSection={<IconSearch size={16} />}
        size="xs"
        styles={{ input: { minHeight: 28, paddingBlock: 0 } }}
        w={compact ? "100%" : 280}
        maw="100%"
        style={{ flex: compact ? "1 1 auto" : undefined }}
        comboboxProps={{ withinPortal: true }}
      />
      <Button size="xs" type="submit" style={{ flexShrink: 0 }}>
        検索
      </Button>
    </Group>
  )
}
