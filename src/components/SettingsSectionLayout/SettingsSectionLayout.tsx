"use client"

import { Box, Group, ScrollArea, Stack } from "@mantine/core"
import type { ReactNode } from "react"

export type SettingsSectionLayoutProps = {
  compact: boolean
  navigation: ReactNode
  children: ReactNode
}

/** Navigation stays outside the page-content scrollport in both responsive layouts. */
export function SettingsSectionLayout({
  compact,
  navigation,
  children,
}: SettingsSectionLayoutProps) {
  return (
    <Box
      maw={1120}
      mx="auto"
      w="100%"
      h="100%"
      pt="lg"
      style={{ minHeight: 0 }}
    >
      {compact ? (
        <Stack gap="xl" h="100%" style={{ minHeight: 0, overflow: "hidden" }}>
          {navigation}
          <ScrollArea
            type="hover"
            offsetScrollbars={true}
            flex={1}
            style={{ minHeight: 0, overscrollBehavior: "contain" }}
          >
            <Box pr="sm">{children}</Box>
          </ScrollArea>
        </Stack>
      ) : (
        <Group
          align="flex-start"
          gap={56}
          wrap="nowrap"
          h="100%"
          style={{ minHeight: 0, overflow: "hidden" }}
        >
          {navigation}
          <ScrollArea
            type="hover"
            offsetScrollbars={true}
            h="100%"
            style={{ flex: 1, minWidth: 0, overscrollBehavior: "contain" }}
            maw={760}
          >
            <Box pr="sm">{children}</Box>
          </ScrollArea>
        </Group>
      )}
    </Box>
  )
}
