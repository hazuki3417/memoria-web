import { MenuList } from "@/components";
import { useNavLink } from "@/hooks";
import { NavLink, Stack } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
export interface SideMenuProps {
  current: string;
}

export const SideMenu = (props: SideMenuProps) => {
  const { current } = props;

  const userMenu = useNavLink({
    current,
    items: [
      { label: "Profile", href: "/setting/profile", leftSection: <IconUser /> },
    ],
  });

  return (
    <Stack component="aside" gap={0}>
      <MenuList>
        {userMenu.map((item) => {
          const { href, ...less } = item;
          return (
            <MenuList.Item key={href}>
              <NavLink href={href} {...less} />
            </MenuList.Item>
          );
        })}
      </MenuList>
    </Stack>
  );
};
