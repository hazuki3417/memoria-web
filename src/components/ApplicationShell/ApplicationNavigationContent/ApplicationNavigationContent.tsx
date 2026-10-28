import type { ComponentType } from "react"
import { Box, Divider, ScrollArea, Stack, Text } from "@mantine/core"
import { NavigationList } from "@/components/NavigationItem/NavigationList"

export type ApplicationNavigationItem = {
  id: string
  label: string
  icon: ComponentType<{
    size?: number
    stroke?: number
    "aria-hidden"?: boolean
  }>
  active?: boolean
  disabled?: boolean
}

export type ApplicationNavigationContentProps = {
  items: ApplicationNavigationItem[]
  accentColor: string
  onSelect: (itemId: string, active: boolean) => void
}

/** Drawerを所有せず、親から与えられる高さの中でナビゲーション内容を表示する。 */
export function ApplicationNavigationContent({
  items,
  accentColor,
  onSelect,
}: ApplicationNavigationContentProps) {
  return (
    <Stack gap={0} h="100%" p="xs" style={{ minHeight: 0 }}>
      <ScrollArea type="hover" style={{ flex: 1, minHeight: 0 }}>
        <Box
          component="nav"
          id="application-context-navigation"
          aria-label="現在のコンテキスト内のナビゲーション"
        >
          <NavigationList
            items={items}
            accentColor={accentColor}
            onSelect={onSelect}
          />
        </Box>
      </ScrollArea>
      <Box mt="auto">
        <Divider mb="xs" />
        <Text size="10px" c="dimmed" px="sm" pb={4}>
          © 2026 Memoria
        </Text>
      </Box>
    </Stack>
  )
}
