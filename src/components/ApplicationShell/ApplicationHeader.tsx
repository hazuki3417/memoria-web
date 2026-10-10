"use client"

import { AppShell, Box, Group, Text } from "@mantine/core"
import type { ReactNode } from "react"

export function ApplicationHeader({
  accentColor,
  leading,
  reserveNavigationSpace = false,
  context,
  account,
}: {
  accentColor?: string
  leading?: ReactNode
  reserveNavigationSpace?: boolean
  context?: ReactNode
  account?: ReactNode
}) {
  return (
    <AppShell.Header
      style={{
        zIndex: 300,
        borderTop: `2px solid ${accentColor ?? "transparent"}`,
      }}
    >
      <Group h="100%" px="md" justify="space-between" wrap="nowrap">
        <Group gap="sm" wrap="nowrap">
          {leading ?? (reserveNavigationSpace ? <Box w="var(--burger-size, 20px)" h="var(--burger-size, 20px)" aria-hidden="true" style={{ flexShrink: 0 }} /> : null)}
          <Text fw={750} size="lg">
            Memoria
          </Text>
          {context}
        </Group>
        {account}
      </Group>
    </AppShell.Header>
  )
}
