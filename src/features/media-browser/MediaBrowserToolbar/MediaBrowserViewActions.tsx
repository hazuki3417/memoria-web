"use client"

import { Button, Menu } from "@mantine/core"
import { IconChevronDown, IconCloudUpload, IconPlus, IconShare } from "@tabler/icons-react"

type MediaBrowserViewActionsProps = {
  context: "personal" | "community"
  communityId: string
  navigate: (path: string) => void
}

export function MediaBrowserViewActions({
  context, communityId, navigate,
}: MediaBrowserViewActionsProps) {
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
