import { ScrollArea } from "@mantine/core"
import React from "react"

export interface ContainerProps {
  children: React.ReactNode
}

export const Container = (props: ContainerProps) => {
  const { children } = props
  return (
    <ScrollArea scrollbarSize={6} style={{ flex: 1 }}>
      {children}
    </ScrollArea>
  )
}
