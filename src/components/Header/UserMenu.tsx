import { Avatar, Flex, Menu, Text, UnstyledButton } from "@mantine/core";
import { IconLogout, IconSettings, IconUser } from "@tabler/icons-react";

export interface UserMenuProps {}

export const UserMenu = (props: UserMenuProps) => {
  return (
    <Menu position="bottom-end" width={200}>
      <Menu.Target>
        <UnstyledButton>
          <Avatar variant="filled" radius="sm" size="sm" />
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        {/* <Menu.Label>アカウント</Menu.Label> */}
        <Menu.Item
          component="a"
          href="/dashboard"
          leftSection={<IconUser size={16} />}
        >
          <Text>ダッシュボード</Text>
        </Menu.Item>
        <Menu.Divider />

        <Menu.Item
          component="a"
          href="/images"
          leftSection={<IconUser size={16} />}
        >
          <Text>画像一覧</Text>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          component="a"
          href="/setting/profile"
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
  );
};
