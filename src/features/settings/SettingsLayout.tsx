"use client"

import { Box, Group, Select, Stack, Text } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { IconChartBar, IconSettings, IconUser, IconUserCircle } from "@tabler/icons-react"
import type { ReactNode } from "react"
import { NavigationItem } from "@/components/NavigationItem"

export type Section = "profile" | "preferences" | "usage" | "account"

const sections = [
  { id: "profile", label: "プロフィール", icon: IconUser },
  { id: "account", label: "アカウント", icon: IconUserCircle },
  { id: "preferences", label: "環境設定", icon: IconSettings },
  { id: "usage", label: "利用状況", icon: IconChartBar },
] satisfies { id: Section; label: string; icon: typeof IconUser }[]


export function SettingsLayout({ section, onSectionChange, children }: { section: Section; onSectionChange: (section: Section) => void; children: ReactNode }) {
  const compact = useMediaQuery("(max-width: 48em)")
  const content = children
  return (
    <Box maw={1120} mx="auto" w="100%">
      {compact ? (
        <Stack gap="xl">
          <Box>
            <Text size="xs" c="dimmed" mb={6}>
              設定
            </Text>
            <Select
              aria-label="設定画面"
              value={section}
              onChange={(value) => value && onSectionChange(value as Section)}
              data={sections.map((item) => ({
                value: item.id,
                label: item.label,
              }))}
              allowDeselect={false}
            />
          </Box>
          <Box>{content}</Box>
        </Stack>
      ) : (
        <Group align="flex-start" gap={56} wrap="nowrap">
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
          <Box style={{ flex: 1 }} maw={760} miw={0}>
            {content}
          </Box>
        </Group>
      )}
    </Box>
  )
}
