"use client"

import { AppShell, Group, Text } from "@mantine/core"
import type { ReactNode } from "react"
import { ApplicationNavigationTrigger } from "./ApplicationNavigation"

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
        zIndex: 100,
        borderTop: `2px solid ${accentColor ?? "transparent"}`,
      }}
    >
      <Group h="100%" px="md" justify="space-between" wrap="nowrap">
        <Group gap="sm" wrap="nowrap">
          {leading ?? (reserveNavigationSpace ? <ApplicationNavigationTrigger opened={false} onToggle={() => undefined} hidden /> : null)}
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
