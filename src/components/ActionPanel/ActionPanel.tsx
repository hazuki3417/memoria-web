import { Box, BoxProps, Flex } from "@mantine/core"
import React, { memo } from "react"
import { Center } from "./Center"
import { Left } from "./Left"
import { Right } from "./Right"

export interface ActionPanelProps extends BoxProps {
  children: React.ReactNode
}

export const ActionPanel = (props: ActionPanelProps) => {
  const { children, ...rest } = props

  return (
    <Box {...rest}>
      <Flex direction="row" align="center" w="100%">
        {children}
      </Flex>
    </Box>
  )
}
ActionPanel.displayName = "ActionPanel"
ActionPanel.Left = memo(Left)
ActionPanel.Center = memo(Center)
ActionPanel.Right = memo(Right)
