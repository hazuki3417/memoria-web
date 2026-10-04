"use client"

import { AppShell, Group, Text } from "@mantine/core"
import type { ReactNode } from "react"

export function ApplicationHeader({
  accentColor,
  leading,
  context,
  account,
}: {
  accentColor?: string
  leading?: ReactNode
  context?: ReactNode
  account?: ReactNode
}) {
  return (
    <AppShell.Header
      style={{
        zIndex: 300,
        borderTop: accentColor ? `2px solid ${accentColor}` : undefined,
      }}
    >
      <Group h="100%" px="md" justify="space-between" wrap="nowrap">
        <Group gap="sm" wrap="nowrap">
          {leading}
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
