"use client"

import { Burger } from "@mantine/core"

export type ApplicationNavigationTriggerProps = {
  opened: boolean
  onToggle: () => void
  hidden?: boolean
}

export function ApplicationNavigationTrigger({
  opened,
  onToggle,
  hidden = false,
}: ApplicationNavigationTriggerProps) {
  return (
    <Burger
      opened={opened}
      onClick={onToggle}
      size="sm"
      disabled={hidden}
      tabIndex={hidden ? -1 : undefined}
      aria-hidden={hidden || undefined}
      style={hidden ? { visibility: "hidden" } : undefined}
      aria-label="ナビゲーションを開閉"
      aria-controls="application-context-navigation"
      aria-expanded={opened}
    />
  )
}
