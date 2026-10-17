"use client"

import { AppShell, Group, Text } from "@mantine/core"
import type { ReactNode } from "react"
import { ApplicationNavigationTrigger } from "../ApplicationNavigationTrigger"

export function ApplicationHeader({
  accentColor,
  leading,
  reserveNavigationSpace = false,
  context,
  account,
  onTitleClick,
}: {
  accentColor?: string
  leading?: ReactNode
  reserveNavigationSpace?: boolean
  context?: ReactNode
  account?: ReactNode
  onTitleClick?: () => void
}) {
  return (
    <AppShell.Header
      style={{
        borderTop: `2px solid ${accentColor ?? "transparent"}`,
      }}
    >
      <Group h="100%" px="md" justify="space-between" wrap="nowrap">
        <Group gap="sm" wrap="nowrap">
          {leading ??
            (reserveNavigationSpace ? (
              <ApplicationNavigationTrigger
                opened={false}
                onToggle={() => undefined}
                hidden
              />
            ) : null)}
          {onTitleClick ? (
            <Text
              component="button"
              type="button"
              fw={750}
              size="lg"
              onClick={onTitleClick}
              aria-label="Memoria - Dashboardへ移動"
              style={{
                border: 0,
                padding: 0,
                background: "transparent",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              Memoria
            </Text>
          ) : (
            <Text fw={750} size="lg">
              Memoria
            </Text>
          )}
          {context}
        </Group>
        {account}
      </Group>
    </AppShell.Header>
  )
}
