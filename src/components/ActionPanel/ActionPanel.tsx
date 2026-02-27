import { Flex, FlexProps } from "@mantine/core"
import React, { memo } from "react"
import { Center } from "./Center"
import { Left } from "./Left"
import { Right } from "./Right"

export interface ActionPanelProps extends Omit<FlexProps, "flex" | "align"> {
  children: React.ReactNode
}

export const ActionPanel = (props: ActionPanelProps) => {
  const { children, ...rest } = props

  return (
    <Flex direction="row" align="center" w="100%" {...rest}>
      {children}
    </Flex>
  )
}
ActionPanel.Left = memo(Left)
ActionPanel.Center = memo(Center)
ActionPanel.Right = memo(Right)
