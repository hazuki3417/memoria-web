"use client"

import { Box, Select, Stack, Text } from "@mantine/core"
import { IconChartBar, IconSettings, IconUser, IconUserCircle } from "@tabler/icons-react"
import { NavigationItem } from "@/components/NavigationItem"

export type SettingsSection = "profile" | "account" | "preferences" | "usage"

const sections = [
  { id: "profile", label: "プロフィール", icon: IconUser },
  { id: "account", label: "アカウント", icon: IconUserCircle },
  { id: "preferences", label: "環境設定", icon: IconSettings },
  { id: "usage", label: "利用状況", icon: IconChartBar },
] satisfies { id: SettingsSection; label: string; icon: typeof IconUser }[]

type SettingsNavigationProps = {
  section: SettingsSection
  compact: boolean
  onSectionChange: (section: SettingsSection) => void
}

export function SettingsNavigation({
  section,
  compact,
  onSectionChange,
}: SettingsNavigationProps) {
  if (compact) {
    return (
      <Box>
        <Text size="xs" c="dimmed" mb={6}>
          設定
        </Text>
        <Select
          aria-label="設定画面"
          value={section}
          onChange={(value) => {
            if (value) onSectionChange(value as SettingsSection)
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
      aria-label="設定"
      w={200}
      style={{ flexShrink: 0 }}
    >
      <Text size="xs" fw={700} c="dimmed" mb="xs">
        設定
      </Text>
      <Stack gap={0}>
        {sections.map((item) => (
          <NavigationItem
            key={item.id}
            label={item.label}
            icon={item.icon}
            active={section === item.id}
            accentColor="var(--mantine-color-blue-6)"
            onClick={() => onSectionChange(item.id)}
          />
        ))}
      </Stack>
    </Box>
  )
}
