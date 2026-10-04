"use client"

import { Box, Burger, Divider, Drawer, Stack, Text } from "@mantine/core"
import { useState } from "react"
import { NavigationItem } from "@/components/NavigationItem"
import type { ApplicationNavigationItem } from "./applicationNavigation"

export function useApplicationNavigation() {
  const [opened, setOpened] = useState(false)
  return { opened, toggle: () => setOpened((value) => !value), close: () => setOpened(false) }
}

export function ApplicationNavigationTrigger({ opened, onToggle }: { opened: boolean; onToggle: () => void }) {
  return <Burger opened={opened} onClick={onToggle} size="sm" aria-label="ナビゲーションを開閉" aria-controls="application-context-navigation" aria-expanded={opened} />
}

export function ApplicationNavigation({ opened, onClose, items, accentColor, onSelect }: { opened: boolean; onClose: () => void; items: ApplicationNavigationItem[]; accentColor: string; onSelect: (itemId: string) => void }) {
  return (
    <Drawer opened={opened} onClose={onClose} position="left" zIndex={200} size={248} withCloseButton={false} padding={0} closeOnClickOutside closeOnEscape overlayProps={{ backgroundOpacity: 0.35, blur: 0 }} styles={{ content: { marginTop: 40, height: "calc(100dvh - 40px)", boxShadow: "var(--mantine-shadow-md)" }, inner: { top: 0 }, overlay: { top: 40, height: "calc(100dvh - 40px)" }, body: { height: "100%" } }}>
      <Stack gap={0} h="100%" p="xs">
        <Box component="nav" id="application-context-navigation" aria-label="現在のコンテキスト内のナビゲーション">
          <Stack gap={0}>
            {items.map((item) => <NavigationItem key={item.id} label={item.label} icon={item.icon} active={item.active} disabled={item.disabled} accentColor={accentColor} onClick={() => { onSelect(item.id); onClose() }} />)}
          </Stack>
        </Box>
        <Box mt="auto"><Divider mb="xs" /><Text size="10px" c="dimmed" px="sm" pb={4}>© 2026 Memoria</Text></Box>
      </Stack>
    </Drawer>
  )
}
