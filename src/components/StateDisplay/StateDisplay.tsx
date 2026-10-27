"use client"

import type { ReactNode, AriaRole } from "react"
import { Box, Center, Group, Stack, Text, ThemeIcon } from "@mantine/core"

export type StateDisplayProps = {
  variant?: "full" | "inline"
  icon?: ReactNode
  title: string
  description?: ReactNode
  action?: ReactNode
  iconColor?: string
  role?: AriaRole
  /** Loadingのテキストは既存の控えめな表現を維持する。 */
  loading?: boolean
}

export function StateDisplay({
  variant = "full",
  icon,
  title,
  description,
  action,
  iconColor,
  role,
  loading = false,
}: StateDisplayProps) {
  if (variant === "inline" && !loading) {
    return (
      <Box role={role}>
        <Group gap="xs" align="flex-start" wrap="nowrap">
          {icon && (
            <ThemeIcon size="sm" color={iconColor} variant="light" radius="xl">
              {icon}
            </ThemeIcon>
          )}
          <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
            <Text size="sm" fw={600}>{title}</Text>
            {description && <Text size="xs" c="dimmed">{description}</Text>}
            {action && <Box>{action}</Box>}
          </Stack>
        </Group>
      </Box>
    )
  }

  if (variant === "inline") {
    return (
      <Center py="md" role={role}>
        <Group gap="xs">
          {icon}
          <Text size="sm" c="dimmed">{title}</Text>
          {description}
          {action}
        </Group>
      </Center>
    )
  }

  return (
    <Center mih={360} role={role}>
      <Stack align="center" maw={loading ? undefined : 420}>
        {loading ? icon : icon && (
          <ThemeIcon size={48} radius="xl" variant="light" color={iconColor}>
            {icon}
          </ThemeIcon>
        )}
        <Text
          fw={loading ? undefined : 700}
          size={loading ? "sm" : "lg"}
          c={loading ? "dimmed" : undefined}
          ta={loading ? undefined : "center"}
        >
          {title}
        </Text>
        {description && <Text size="sm" c="dimmed" ta="center">{description}</Text>}
        {action}
      </Stack>
    </Center>
  )
}
