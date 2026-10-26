"use client"

import { Button, Group, Menu, TagsInput } from "@mantine/core"
import { IconChevronDown, IconCloudUpload, IconPlus, IconSearch, IconShare } from "@tabler/icons-react"

type MediaBrowserViewProps = {
  compact: boolean
  tags: string[]
  onTagsChange: (tags: string[]) => void
  onSubmitTags: () => void
  tagOptions?: string[]
  context: "personal" | "community"
  communityId: string
  navigate: (path: string) => void
}

export function MediaBrowserViewSearch({
  compact, tags, onTagsChange, onSubmitTags, tagOptions,
}: Pick<MediaBrowserViewProps, "compact" | "tags" | "onTagsChange" | "onSubmitTags" | "tagOptions">) {
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

export function MediaBrowserViewActions({
  context, communityId, navigate,
}: Pick<MediaBrowserViewProps, "context" | "communityId" | "navigate">) {
  return context === "personal" ? (
    <Button
      size="xs"
      leftSection={<IconCloudUpload size={16} />}
      onClick={() => navigate("/media/upload")}
    >
      アップロード
    </Button>
  ) : (
    <Menu position="bottom-end">
      <Menu.Target>
        <Button
          size="xs"
          rightSection={<IconChevronDown size={14} />}
          leftSection={<IconPlus size={16} />}
        >
          Mediaを追加
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconCloudUpload size={16} />}
          onClick={() => navigate(`/communities/${communityId}/media/upload`)}
        >
          Communityへアップロード
        </Menu.Item>
        <Menu.Item leftSection={<IconShare size={16} />}>
          Personal Mediaから共有
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}
