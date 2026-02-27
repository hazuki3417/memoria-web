import { Box, BoxProps } from "@mantine/core"
import React from "react"
import { MenuListItem } from "./MenuListItem"

export interface MenuListProps extends Omit<BoxProps, "component"> {
  children: React.ReactNode
}

export const MenuList = (props: MenuListProps) => {
  const { children, style, ...less } = props

  return (
    <Box
      component="ul"
      style={(theme) => ({
        listStyle: "none",
        margin: 0,
        padding: 0,
        ...style,
      })}
      {...less}
    >
      {children}
    </Box>
  )
}

MenuList.Item = MenuListItem
