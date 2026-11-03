"use client"

import { Box, Group, Paper, Stack, Text, ThemeIcon } from "@mantine/core"
import type { ReactNode } from "react"
import { feedbackAppearance, icons, type FeedbackKind } from "../feedbackAppearance"

export type FeedbackPanelProps = {
  /** Visual severity only. The feature owns the error's meaning and recovery. */
  kind: FeedbackKind
  title: string
  children: ReactNode
  /** Feature-owned actions, placed next to the explanation they resolve. */
  actions?: ReactNode
  /** Only announce genuinely new information; never duplicate Field Error. */
  role?: "alert" | "status"
}

/**
 * Persistent, non-modal operation feedback. Does not dismiss itself, steal
 * focus, classify GraphQL errors, or invoke recovery actions.
 *
 * Opt-in alongside FeedbackAlert until existing consumers are reviewed.
 */
export function FeedbackPanel({
  kind,
  title,
  children,
  actions,
  role,
}: FeedbackPanelProps) {
  const appearance = feedbackAppearance(kind)
  const Icon = icons[kind]

  return (
    <Paper
      withBorder
      radius="md"
      p="md"
      role={role}
      style={{ backgroundColor: appearance.backgroundColor }}
    >
      <Group align="flex-start" wrap="nowrap" gap="sm">
        <ThemeIcon
          color={appearance.color}
          variant="light"
          radius="md"
          size={30}
          aria-hidden="true"
        >
          <Icon size={18} stroke={1.8} />
        </ThemeIcon>
        <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
          <Text size="sm" fw={600}>
            {title}
          </Text>
          <Box fz="sm">{children}</Box>
          {actions && (
            <Group gap="xs" mt="xs" wrap="wrap">
              {actions}
            </Group>
          )}
        </Stack>
      </Group>
    </Paper>
  )
}
