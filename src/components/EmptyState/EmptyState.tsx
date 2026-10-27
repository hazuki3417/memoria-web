"use client"

import type { ReactNode } from "react"
import { Center, Stack, Text, ThemeIcon } from "@mantine/core"

type EmptyStateProps = {
  icon: ReactNode
  title: string
  description: ReactNode
  action?: ReactNode
  iconColor?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  iconColor,
}: EmptyStateProps) {
  return (
    <Center mih={360}>
      <Stack align="center" maw={420}>
        <ThemeIcon size={48} radius="xl" variant="light" color={iconColor}>
          {icon}
        </ThemeIcon>
        <Text fw={700} size="lg">{title}</Text>
        <Text size="sm" c="dimmed" ta="center">{description}</Text>
        {action}
      </Stack>
    </Center>
  )
}
