"use client"

import { Box, Group, Stack } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import type { ReactNode } from "react"
import { SettingsNavigation, type SettingsSection } from "./SettingsNavigation"

export type Section = SettingsSection

type SettingsLayoutProps = {
  section: Section
  onSectionChange: (section: Section) => void
  children: ReactNode
}

export function SettingsLayout({
  section,
  onSectionChange,
  children,
}: SettingsLayoutProps) {
  const compact = useMediaQuery("(max-width: 48em)")

  return (
    <Box maw={1120} mx="auto" w="100%">
      {compact ? (
        <Stack gap="xl">
          <SettingsNavigation
            section={section}
            compact
            onSectionChange={onSectionChange}
          />
          <Box>{children}</Box>
        </Stack>
      ) : (
        <Group align="flex-start" gap={56} wrap="nowrap">
          <SettingsNavigation
            section={section}
            compact={false}
            onSectionChange={onSectionChange}
          />
          <Box style={{ flex: 1 }} maw={760} miw={0}>
            {children}
          </Box>
        </Group>
      )}
    </Box>
  )
}
