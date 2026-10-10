import { Box, Group, Progress, Stack, Text } from "@mantine/core"
import { PageHeader } from "@/components/PageHeader"
import { SectionHeader } from "@/components/SectionHeader"

export type SettingsUsageData = {
  usedStorageLabel: string
  effectiveLimitLabel: string
  storageUsagePercent: number
  mediaCount: number
}

export function SettingsUsage({ usage }: { usage: SettingsUsageData }) {
  return (
    <Stack gap="xl">
      <PageHeader
        title="利用状況"
        description="ストレージの使用量と総Media件数を確認します。"
      />
      <Box>
        <SectionHeader>ストレージ</SectionHeader>
        <Stack gap="sm">
          <Group justify="space-between" align="end">
            <Box>
              <Text fw={700} size="xl">
                {usage.usedStorageLabel} 使用中
              </Text>
              <Text size="sm" c="dimmed">
                {usage.effectiveLimitLabel} 中
              </Text>
            </Box>
            <Text size="sm" fw={600}>
              {usage.storageUsagePercent}%
            </Text>
          </Group>
          <Progress
            value={usage.storageUsagePercent}
            size="md"
            aria-label={`ストレージ使用率 ${usage.storageUsagePercent}%`}
          />
        </Stack>
      </Box>
      <Box>
        <SectionHeader>Media</SectionHeader>
        <Text fw={700} size="xl">
          {usage.mediaCount.toLocaleString("ja-JP")}件
        </Text>
      </Box>
    </Stack>
  )
}
