import { resolveUri } from "@/lib/url"
import { Avatar, Menu, Text, UnstyledButton } from "@mantine/core"
import {
  IconDashboard,
  IconLogout,
  IconPhoto,
  IconSettings,
} from "@tabler/icons-react"

export interface UserMenuProps {}

export const UserMenu = (props: UserMenuProps) => {
  return (
    <Menu position="bottom-end" width={200}>
      <Menu.Target>
        <UnstyledButton>
          <Avatar variant="filled" radius="sm" size={30} />
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        {/* <Menu.Label>アカウント</Menu.Label> */}
        <Menu.Item
          component="a"
          href={resolveUri("/dashboard")}
          leftSection={<IconDashboard size={16} />}
        >
          <Text>ダッシュボード</Text>
        </Menu.Item>
        <Menu.Divider />

        <Menu.Item
          component="a"
          href={resolveUri("/images")}
          leftSection={<IconPhoto size={16} />}
        >
          <Text>画像管理</Text>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          component="a"
          href={resolveUri("/settings/profile")}
          leftSection={<IconSettings size={16} />}
        >
          <Text>設定</Text>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          color="red"
          component="a"
          href="/auth/logout"
          leftSection={<IconLogout size={16} />}
        >
          <Text>ログアウト</Text>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}
