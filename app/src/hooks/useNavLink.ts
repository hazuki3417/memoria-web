import { NavLinkProps } from "@mantine/core";
import { useMemo } from "react";

export type NavLink = NavLinkProps & {
  href: string;
};

export type UseNavLinkOption = {
  current: string;
  items: NavLink[];
};

export interface UseNavLink extends NavLink {
  active: boolean;
}

export function useNavLink(option: UseNavLinkOption): UseNavLink[] {
  const { current, items } = option;
  return useMemo(() => {
    return items.map((link) => {
      const { href, ...less } = link;
      return {
        href,
        active: current.startsWith(href),
        ...less,
      };
    });
  }, [current, items]);
}
