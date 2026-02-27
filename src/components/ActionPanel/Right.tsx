import { Flex, FlexProps } from "@mantine/core"
import React from "react"

export interface RightProps extends Omit<FlexProps, "justify" | "align"> {
  children: React.ReactNode
}

export const Right = (props: RightProps) => {
  const { children, ...lest } = props
  return (
    <Flex flex={1} align="center" justify="flex-end" {...lest}>
      {children}
    </Flex>
  )
}
Right.displayName = "ActionPanel.Right"
