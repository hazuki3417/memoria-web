import { Box, type BoxProps } from "@mantine/core"
import type React from "react"

export interface HeaderProps extends BoxProps {
  children: React.ReactNode
}

export const Header = (props: HeaderProps) => {
  const { children, ...rest } = props
  return <Box {...rest}>{children}</Box>
}
