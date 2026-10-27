"use client"

import { Box, Group, Stack } from "@mantine/core"
import type { ReactNode } from "react"

export type SettingsSectionLayoutProps = {
  compact: boolean
  navigation: ReactNode
  children: ReactNode
}

/**
 * Shared Personal / Community settings presentation.
 * Preserve the existing two layouts without redefining responsive behavior.
 */
export function SettingsSectionLayout({
  compact,
  navigation,
  children,
}: SettingsSectionLayoutProps) {
  return (
    <Box maw={1120} mx="auto" w="100%">
      {compact ? (
        <Stack gap="xl">
          {navigation}
          <Box>{children}</Box>
        </Stack>
      ) : (
        <Group align="flex-start" gap={56} wrap="nowrap">
          {navigation}
          <Box style={{ flex: 1 }} maw={760} miw={0}>
            {children}
          </Box>
        </Group>
      )}
    </Box>
  )
}
