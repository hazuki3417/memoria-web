"use client"

import { Avatar, Box, Button, Group, Menu, Text } from "@mantine/core"
import { IconLogout, IconSettings } from "@tabler/icons-react"
import type { ApplicationContextOption } from "./types"

export function ApplicationAccountMenu({ user, currentContext, onOpenSettings, onLogout }: { user: { displayName: string; avatarLabel?: string }; currentContext: ApplicationContextOption; onOpenSettings: () => void; onLogout: () => void }) {
  return <Menu position="bottom-end" withinPortal>
    <Menu.Target><Button variant="subtle" color="gray" size="compact-sm" px={4} aria-label="アカウントメニュー" title="アカウントメニュー"><Avatar size={24} radius="xl">{user.avatarLabel ?? user.displayName.slice(0, 1)}</Avatar></Button></Menu.Target>
    <Menu.Dropdown>
      <Group gap="sm" px="xs" py="xs" wrap="nowrap"><Avatar size={32} radius="xl">{user.avatarLabel ?? user.displayName.slice(0, 1)}</Avatar><Box><Text size="sm" fw={600} lh={1.2}>{user.displayName}</Text><Text size="xs" c="dimmed" lh={1.2}>{currentContext.label}</Text></Box></Group>
      <Menu.Divider /><Menu.Item leftSection={<IconSettings size={16} stroke={1.6} />} onClick={onOpenSettings}>設定</Menu.Item>
      <Menu.Divider /><Menu.Item leftSection={<IconLogout size={16} stroke={1.6} />} onClick={onLogout}>ログアウト</Menu.Item>
    </Menu.Dropdown>
  </Menu>
}
