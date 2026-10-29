"use client"

import { Drawer } from "@mantine/core"
import { ApplicationNavigationContent } from "../ApplicationNavigationContent"
import type { ApplicationNavigationItem } from "../ApplicationNavigationContent/ApplicationNavigationContent"

export type ApplicationNavigationProps = {
  opened: boolean
  onClose: () => void
  items: ApplicationNavigationItem[]
  accentColor: string
  onSelect: (itemId: string) => void
}

export function ApplicationNavigation({
  opened,
  onClose,
  items,
  accentColor,
  onSelect,
}: ApplicationNavigationProps) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="left"
      size={248}
      withCloseButton={false}
      padding={0}
      closeOnClickOutside
      closeOnEscape
      overlayProps={{ backgroundOpacity: 0.35, blur: 0 }}
      styles={{
        content: {
          marginTop: 40,
          height: "calc(100dvh - 40px)",
          boxShadow: "var(--mantine-shadow-md)",
        },
        inner: { top: 0 },
        overlay: { top: 40, height: "calc(100dvh - 40px)" },
        body: { height: "100%" },
      }}
    >
      <ApplicationNavigationContent
        items={items}
        accentColor={accentColor}
        onSelect={(itemId, active) => {
          if (!active) onSelect(itemId)
          onClose()
        }}
      />
    </Drawer>
  )
}
