import { Box, Divider, ScrollArea, Stack, Text } from "@mantine/core"
import { NavigationItem } from "@/components/NavigationItem"
import type { ApplicationNavigationItem } from "../types"

export type ApplicationNavigationContentProps = {
  items: ApplicationNavigationItem[]
  accentColor: string
  onSelect: (itemId: string) => void
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
          <Stack gap={0}>
            {items.map((item) => (
              <NavigationItem
                key={item.id}
                label={item.label}
                icon={item.icon}
                active={item.active}
                disabled={item.disabled}
                accentColor={accentColor}
                onClick={() => onSelect(item.id)}
              />
            ))}
          </Stack>
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
