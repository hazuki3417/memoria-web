import { Box, type BoxProps } from "@mantine/core"
import type React from "react"

export interface BodyProps extends BoxProps {
  children: React.ReactNode
}

export const Body = (props: BodyProps) => {
  const { children, ...rest } = props
  return <Box {...rest}>{children}</Box>
}
