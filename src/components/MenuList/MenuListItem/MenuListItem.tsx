import { Box, BoxProps } from "@mantine/core"
import React from "react"

export interface MenuListItemProps extends Omit<BoxProps, "component"> {
  children: React.ReactNode
}

export const MenuListItem = (props: MenuListItemProps) => {
  const { children, style, ...less } = props

  return (
    <Box
      component="li"
      style={(theme) => ({
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
