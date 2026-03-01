import { Box, BoxProps } from "@mantine/core"
import React from "react"

export interface SettingSectionProps extends Omit<BoxProps, "section"> {
  children: React.ReactNode
}

export const SettingSection = (props: SettingSectionProps) => {
  const { children, ...rest } = props

  return (
    <Box component="section" {...rest}>
      {children}
    </Box>
  )
}
