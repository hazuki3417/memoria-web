"use client"

import { Avatar, Button, Menu, Skeleton } from "@mantine/core"
import { IconLogout, IconSettings, IconUser } from "@tabler/icons-react"
import type { ApplicationContextOption } from "../types"
import { AccountMenuProfile } from "./AccountMenuProfile"

export function ApplicationAccountMenu({
  user,
  currentContext,
  onOpenSettings,
  onLogout,
  profileStatus = "ready",
}: {
  user: { displayName: string; avatarLabel?: string }
  currentContext: ApplicationContextOption
  onOpenSettings: () => void
  onLogout: () => void
  profileStatus?: "ready" | "loading" | "error"
}) {
  return (
    <Menu position="bottom-end" withinPortal>
      <Menu.Target>
        <Button
          variant="subtle"
          color="gray"
          size="compact-sm"
          px={4}
          aria-label="アカウントメニュー"
          title="アカウントメニュー"
        >
          {profileStatus === "loading" ? (
            <Skeleton circle height={24} aria-label="ユーザー情報を読み込み中" />
          ) : (
            <Avatar size={24} radius="xl">
              {profileStatus === "error" ? (
                <IconUser size={16} aria-hidden="true" />
              ) : (
                user.avatarLabel ?? user.displayName.slice(0, 1)
              )}
            </Avatar>
          )}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <AccountMenuProfile
          displayName={user.displayName}
          avatarLabel={user.avatarLabel}
          contextLabel={currentContext.label}
          status={profileStatus}
        />
        <Menu.Divider />
        <Menu.Item
          leftSection={<IconSettings size={16} stroke={1.6} />}
          onClick={onOpenSettings}
        >
          設定
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          leftSection={<IconLogout size={16} stroke={1.6} />}
          onClick={onLogout}
        >
          ログアウト
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}
