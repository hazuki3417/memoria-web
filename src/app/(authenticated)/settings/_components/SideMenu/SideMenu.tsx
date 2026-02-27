import { MenuList } from "@/components";
import { useNavLink } from "@/hooks";
import { resolveUri } from "@/lib/url";
import { Box, NavLink, Stack } from "@mantine/core";
import { IconBell, IconUser } from "@tabler/icons-react";

export interface SideMenuProps {
  current: string;
}

export const SideMenu = (props: SideMenuProps) => {
  const { current } = props;

  const userMenu = useNavLink({
    current,
    items: [
      {
        label: "Profile",
        href: resolveUri("/settings/profile"),
        leftSection: <IconUser size={20} />,
      },
      {
        label: "Notifications",
        href: resolveUri("/settings/notifications"),
        leftSection: <IconBell size={20} />,
      },
    ],
  });

  return (
    <Box component="aside" w={{ base: "100%", sm: 200 }}>
      <Stack gap={0}>
        <MenuList>
          {userMenu.map((item) => {
            const { href, ...less } = item;
            return (
              <MenuList.Item key={href}>
                <NavLink
                  href={href}
                  style={(theme) => ({ padding: "4px 8px" })}
                  {...less}
                />
              </MenuList.Item>
            );
          })}
        </MenuList>
      </Stack>
    </Box>
  );
};
