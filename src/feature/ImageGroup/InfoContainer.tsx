import { Box, BoxProps } from "@mantine/core"
import React from "react"

export interface InfoContainerProps extends BoxProps {
  children: React.ReactNode
}

export const InfoContainer = (props: InfoContainerProps) => {
  const { style, ...rest } = props
  return (
    <Box
      {...rest}
      style={{
        ...style,
      }}
    />
  )
}
InfoContainer.displayName = "InfoGroup.InfoContainer"
