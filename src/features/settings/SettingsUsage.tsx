import { Box, Group, Progress, Stack, Table, Text } from "@mantine/core"
import { PageHeader } from "@/components/PageHeader"
import { SectionHeader } from "@/components/SectionHeader"

export type SettingsUsageData = {
  usedStorageLabel: string
  effectiveLimitLabel: string
  storageUsagePercent: number
  mediaCount: number
  formatBreakdown?: { format: string; count: number; sizeLabel: string }[]
}

export function SettingsUsage({ usage }: { usage: SettingsUsageData }) {
  return (
    <Stack gap="xl">
      <PageHeader
        title="利用状況"
        description="Personal Mediaの登録済みオリジナルファイルの使用状況を確認します。"
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
        <SectionHeader>登録済みオリジナル</SectionHeader>
        <Text fw={700} size="xl">
          {usage.mediaCount.toLocaleString("ja-JP")}件
        </Text>
      </Box>
      {usage.formatBreakdown && (
        <Box>
          <SectionHeader>ファイル形式別内訳</SectionHeader>
          <Table
            striped
            highlightOnHover
            data={{
              head: ["形式", "登録件数", "使用量"],
              body: usage.formatBreakdown.map((item) => [
                item.format,
                item.count.toLocaleString("ja-JP") + "件",
                item.sizeLabel,
              ]),
            }}
          />
        </Box>
      )}
    </Stack>
  )
}
