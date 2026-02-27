import { Box, type BoxProps } from "@mantine/core"
import type React from "react"

export interface FooterProps extends BoxProps {
  children: React.ReactNode
}

export const Footer = (props: FooterProps) => {
  const { children, ...rest } = props
  return <Box {...rest}>{children}</Box>
}
