"use client"

import { ActionIcon, Button, Group, TagsInput } from "@mantine/core"
import { useState } from "react"
import { IconSearch, IconX } from "@tabler/icons-react"

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
  const [searchValue, setSearchValue] = useState("")

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
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        rightSection={
          searchValue ? (
            <ActionIcon
              variant="subtle"
              color="gray"
              size="xs"
              aria-label="検索入力をクリア"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setSearchValue("")}
            >
              <IconX size={14} />
            </ActionIcon>
          ) : undefined
        }
        rightSectionPointerEvents="all"
        leftSection={<IconSearch size={16} />}
        size="xs"
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
