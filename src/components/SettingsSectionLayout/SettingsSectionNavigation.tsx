"use client"

import { Box, Select, Text } from "@mantine/core"
import type { ComponentType } from "react"
import { NavigationList } from "@/components/NavigationItem/NavigationList"

export type SettingsSectionItem<Section extends string> = {
  id: Section
  label: string
  icon: ComponentType<{
    size?: number
    stroke?: number
    "aria-hidden"?: boolean
  }>
}

export type SettingsSectionNavigationProps<Section extends string> = {
  section: Section
  sections: readonly SettingsSectionItem<Section>[]
  compact: boolean
  ariaLabel: string
  desktopAriaLabel: string
  accentColor: string
  onSectionChange: (section: Section) => void
}

export function SettingsSectionNavigation<Section extends string>({
  section,
  sections,
  compact,
  ariaLabel,
  desktopAriaLabel,
  accentColor,
  onSectionChange,
}: SettingsSectionNavigationProps<Section>) {
  if (compact) {
    return (
      <Box>
        <Text size="xs" c="dimmed" mb={6}>
          設定
        </Text>
        <Select
          aria-label={ariaLabel}
          value={section}
          onChange={(value) => {
            if (value && value !== section) onSectionChange(value as Section)
          }}
          data={sections.map((item) => ({
            value: item.id,
            label: item.label,
          }))}
          allowDeselect={false}
        />
      </Box>
    )
  }

  return (
    <Box
      component="nav"
      aria-label={desktopAriaLabel}
      w={200}
      style={{ flexShrink: 0 }}
    >
      <Text size="xs" fw={700} c="dimmed" mb="xs">
        設定
      </Text>
      <NavigationList
        items={sections.map((item) => ({
          ...item,
          active: section === item.id,
        }))}
        accentColor={accentColor}
        onSelect={(id, active) => {
          if (!active) onSectionChange(id)
        }}
      />
    </Box>
  )
}
