"use client"

import { Avatar, Button, Menu, Skeleton } from "@mantine/core"
import { IconLogout, IconSettings, IconUser } from "@tabler/icons-react"
import type { ApplicationContextOption } from "../types"
import {
  AccountMenuProfile,
  type AccountMenuProfileState,
} from "./AccountMenuProfile/AccountMenuProfile"

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
  const profile: AccountMenuProfileState =
    profileStatus === "loading"
      ? { status: "loading" }
      : profileStatus === "error"
        ? { status: "error" }
        : {
            status: "ready",
            displayName: user.displayName,
            avatarLabel: user.avatarLabel,
            contextLabel: currentContext.label,
          }

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
          <Skeleton visible={profile.status === "loading"} circle>
            <Avatar size={24} radius="xl">
              {profile.status === "ready" ? (
                (profile.avatarLabel ?? profile.displayName.slice(0, 1))
              ) : (
                <IconUser size={16} aria-hidden="true" />
              )}
            </Avatar>
          </Skeleton>
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <AccountMenuProfile state={profile} />
        <Menu.Divider />
        <Menu.Item
          leftSection={<IconSettings size={16} stroke={1.6} />}
          onClick={onOpenSettings}
        >
          設定
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          color="red.5"
          leftSection={<IconLogout size={16} stroke={1.6} />}
          onClick={onLogout}
        >
          ログアウト
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}
