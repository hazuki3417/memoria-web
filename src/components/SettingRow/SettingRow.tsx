import { Box, Group, Text } from "@mantine/core"
import type { ReactNode } from "react"

export type SettingRowProps = {
  label: string
  description: string
  children: ReactNode
  compact: boolean
}

export function SettingRow({
  label,
  description,
  children,
  compact,
}: SettingRowProps) {
  return (
    <Group
      justify="space-between"
      align={compact ? "stretch" : "center"}
      wrap={compact ? "wrap" : "nowrap"}
      gap="md"
    >
      <Box style={{ flex: 1 }} miw={0}>
        <Text fw={600} size="sm">
          {label}
        </Text>
        <Text c="dimmed" size="sm" mt={2}>
          {description}
        </Text>
      </Box>
      <Box w={compact ? "100%" : 180}>{children}</Box>
    </Group>
  )
}
