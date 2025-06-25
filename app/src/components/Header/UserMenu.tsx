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
        <Menu.Label>アカウント</Menu.Label>
        <Menu.Item>
          <Flex gap={4} align={"center"}>
            <IconUser size={16} />
            <Text>プロフィール</Text>
          </Flex>
        </Menu.Item>
        <Menu.Item onClick={() => console.debug("setting")}>
          <Flex gap={4} align={"center"}>
            <IconSettings size={16} />
            <Text>設定</Text>
          </Flex>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item color="red" component="a" href="/auth/logout">
          <Flex gap={4} align={"center"}>
            <IconLogout size={16} />
            <Text>ログアウト</Text>
          </Flex>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
