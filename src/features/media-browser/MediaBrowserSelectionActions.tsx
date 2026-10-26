"use client"

import { Badge, Button } from "@mantine/core"
import { IconEdit, IconFolderPlus, IconShare, IconTrash } from "@tabler/icons-react"

type MediaBrowserSelectionProps = {
  selected: Set<string>
  context: "personal" | "community"
  communityId: string
  hasRemoteItems: boolean
  navigate: (path: string) => void
  onSelectionDialog: (dialog: "group" | "share" | "delete") => void
}

export function MediaBrowserSelectionCount({
  count,
}: { count: number }) {
  return <Badge size="lg" variant="light">{count}件選択</Badge>
}

export function MediaBrowserSelectionActions({
  selected,
  context,
  communityId,
  hasRemoteItems,
  navigate,
  onSelectionDialog,
}: MediaBrowserSelectionProps) {
  return (
    <>
      <Button
        size="xs"
        variant="default"
        leftSection={<IconEdit size={15} />}
        disabled={selected.size === 0}
        onClick={() =>
          navigate(
            context === "community"
              ? `/communities/${communityId}/media/edit?mediaIds=${encodeURIComponent([...selected].join(","))}`
              : `/media/edit?mediaIds=${encodeURIComponent([...selected].join(","))}`,
          )
        }
      >
        編集
      </Button>
      <Button
        size="xs"
        variant="default"
        leftSection={<IconFolderPlus size={15} />}
        disabled={selected.size === 0}
        onClick={() => onSelectionDialog("group")}
      >
        Group
      </Button>
      {context === "personal" && (
        <Button
          size="xs"
          variant="default"
          leftSection={<IconShare size={15} />}
          disabled={selected.size === 0}
          onClick={() => onSelectionDialog("share")}
        >
          共有
        </Button>
      )}
      <Button
        size="xs"
        variant="default"
        color="red"
        leftSection={<IconTrash size={15} />}
        disabled={selected.size === 0 || hasRemoteItems}
        onClick={() => onSelectionDialog("delete")}
      >
        削除
      </Button>
    </>
  )
}
