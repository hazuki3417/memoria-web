import { Box, Group, Progress, Stack, Table, Text } from "@mantine/core"
import { PageHeader } from "@/components/PageHeader"
import { SectionHeader } from "@/components/SectionHeader"

export type SettingsUsageData = {
  usedStorageLabel: string
  effectiveLimitLabel: string
  availableStorageLabel: string
  storageUsagePercent: number
  mediaCount: number
  formatBreakdown?: { format: string; count: number; sizeLabel: string; capacityPercent: number }[]
}

const formatColors: Record<string, string> = {
  JPEG: "blue",
  PNG: "teal",
  WebP: "violet",
  "HEIC / HEIF": "orange",
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
          <Group justify="space-between" align="center" wrap="wrap">
            <Text size="sm">使用済み</Text>
            <Text size="sm" ta="right">
              {usage.usedStorageLabel}{` ( ${usage.storageUsagePercent} % )`}
            </Text>
          </Group>
          <Group justify="space-between" align="center" wrap="wrap">
            <Text size="sm">空き容量</Text>
            <Text size="sm" ta="right">
              {usage.availableStorageLabel}{` ( ${Math.max(0, 100 - usage.storageUsagePercent).toFixed(1).replace(/\.0$/, "")} % )`}
            </Text>
          </Group>
          <Progress.Root size="md" aria-label={`ストレージ使用率 ${usage.storageUsagePercent}%、ファイル形式別内訳`}>
            {usage.formatBreakdown?.map((item) => (
              <Progress.Section
                key={item.format}
                value={item.capacityPercent}
                color={formatColors[item.format] ?? "gray"}
                aria-label={`${item.format} ${item.capacityPercent}%`}
              />
            )) ?? <Progress.Section value={usage.storageUsagePercent} color="blue" />}
          </Progress.Root>
          <Group justify="space-between" align="center" wrap="wrap">
            <Text size="sm">総容量</Text>
            <Text size="sm" ta="right">
              {usage.effectiveLimitLabel} ( 100 % )
            </Text>
          </Group>
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
                <Table.Th ta="right">割合</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {usage.formatBreakdown.map((item) => (
                <Table.Tr key={item.format}>
                  <Table.Td>
                    <Group gap="xs" wrap="nowrap">
                      <Box w={12} h={12} bg={`var(--mantine-color-${formatColors[item.format] ?? "gray"}-6)`} style={{ flexShrink: 0 }} aria-hidden="true" />
                      <Text size="sm">{item.format}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td ta="right">{item.count.toLocaleString("ja-JP")} 件</Table.Td>
                  <Table.Td ta="right">{item.sizeLabel}</Table.Td>
                  <Table.Td ta="right">{item.capacityPercent} %</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
            <Table.Tfoot style={{ borderTop: "2px solid var(--mantine-color-default-border)" }}>
              <Table.Tr>
                <Table.Th>合計</Table.Th>
                <Table.Th ta="right">{usage.mediaCount.toLocaleString("ja-JP")} 件</Table.Th>
                <Table.Th ta="right">{usage.usedStorageLabel}</Table.Th>
                <Table.Th ta="right">{usage.storageUsagePercent} %</Table.Th>
              </Table.Tr>
            </Table.Tfoot>
          </Table>
        </Box>
      )}
    </Stack>
  )
}
