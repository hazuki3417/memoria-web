import { Flex, FlexProps } from "@mantine/core"
import React from "react"

export interface LeftProps extends Omit<FlexProps, "justify" | "align"> {
  children?: React.ReactNode
}

export const Left = (props: LeftProps) => {
  const { children, ...lest } = props
  return (
    <Flex flex={1} align="center" justify="flex-start" {...lest}>
      {children}
    </Flex>
  )
}
Left.displayName = "ActionPanel.Left"
