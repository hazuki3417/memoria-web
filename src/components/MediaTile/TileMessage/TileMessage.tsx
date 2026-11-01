"use client"

import { Center, Stack, Text } from "@mantine/core"
import type { ReactNode } from "react"

export function TileMessage({
  icon,
  title,
  description,
}: {
  icon: ReactNode
  title: string
  description?: string
}) {
  return (
    <Center h="100%" w="100%">
      <Stack align="center" gap={6} p="xs" c="dimmed">
        {icon}
        <Text size="xs" fw={600} ta="center">
          {title}
        </Text>
        {description && (
          <Text size="10px" ta="center">
            {description}
          </Text>
        )}
      </Stack>
    </Center>
  )
}
