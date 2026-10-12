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

export function SettingsUsage({ usage, scope = "personal" }: { usage: SettingsUsageData; scope?: "personal" | "community" }) {
  return (
    <Stack gap="xl">
      <PageHeader
        title="利用状況"
        description={scope === "community" ? "このCommunityが管理する登録済みオリジナルファイルの使用状況を確認します。" : "Personal Mediaの登録済みオリジナルファイルの使用状況を確認します。"}
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
      {usage.formatBreakdown && (
        <Box>
          <SectionHeader>ファイル形式別内訳</SectionHeader>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>形式</Table.Th>
                <Table.Th ta="right">登録件数</Table.Th>
                <Table.Th ta="right">使用量</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {usage.formatBreakdown.map((item) => (
                <Table.Tr key={item.format}>
                  <Table.Td>{item.format}</Table.Td>
                  <Table.Td ta="right">{item.count.toLocaleString("ja-JP")} 件</Table.Td>
                  <Table.Td ta="right">{item.sizeLabel}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
            <Table.Tfoot style={{ borderTop: "2px solid var(--mantine-color-default-border)" }}>
              <Table.Tr>
                <Table.Th>合計</Table.Th>
                <Table.Th ta="right">{usage.mediaCount.toLocaleString("ja-JP")} 件</Table.Th>
                <Table.Th ta="right">{usage.usedStorageLabel}</Table.Th>
              </Table.Tr>
            </Table.Tfoot>
          </Table>
        </Box>
      )}
    </Stack>
  )
}
