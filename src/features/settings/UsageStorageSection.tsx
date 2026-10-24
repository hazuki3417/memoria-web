"use client"

import { Box, Group, Progress, Skeleton, Stack, Text } from "@mantine/core"
import { SectionHeader } from "@/components/SectionHeader"
import type { FileSizeUnit } from "./formatFileSize"
import { formatFileSize } from "./formatFileSize"
import { usagePercent } from "./usagePercent"
import { usageFormatColors as formatColors } from "./usageFormatColors"
import type { SettingsUsageData, UsageStatus } from "./usageTypes"

/** サイズと割合の桁位置を各行で揃え、全体を読み上げ可能に保つ。 */
function StorageValue({
  bytes,
  percent,
  fileSizeUnit,
}: {
  bytes: number
  percent: number
  fileSizeUnit: FileSizeUnit
}) {
  const { value, unit } = formatFileSize(bytes, fileSizeUnit)
  return (
    <Text
      size="sm"
      ta="right"
      aria-label={`${value} ${unit} ( ${percent} % )`}
      style={{
        display: "inline-grid",
        gridTemplateColumns: "9ch 9ch",
        columnGap: "4px",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <span>{value} {unit}</span>
      <span>( {percent} % )</span>
    </Text>
  )
}

export function UsageStorageSection({
  usage,
  status,
  fileSizeUnit,
}: {
  usage: SettingsUsageData
  status: UsageStatus
  fileSizeUnit: FileSizeUnit
}) {
  return (
    <Box>
      <SectionHeader>ストレージ</SectionHeader>
      <Stack gap="sm">
        <Group justify="space-between" align="center" wrap="wrap">
          <Text size="sm">使用済み</Text>
          {status === "loading" ? (
            <Skeleton w={92} h={16} radius="sm" />
          ) : (
            <StorageValue bytes={usage.usedBytes} percent={usagePercent(usage.usedBytes, usage.limitBytes)} fileSizeUnit={fileSizeUnit} />
          )}
        </Group>
        <Group justify="space-between" align="center" wrap="wrap">
          <Text size="sm">空き容量</Text>
          {status === "loading" ? (
            <Skeleton w={92} h={16} radius="sm" />
          ) : (
            <StorageValue
              bytes={Math.max(0, usage.limitBytes - usage.usedBytes)}
              percent={Number(Math.max(0, 100 - usagePercent(usage.usedBytes, usage.limitBytes)).toFixed(1))}
              fileSizeUnit={fileSizeUnit}
            />
          )}
        </Group>
        {status === "loading" ? (
          <Skeleton h={12} radius="xl" />
        ) : (
          <Progress.Root
            size="md"
            aria-label={`ストレージ使用率 ${usagePercent(usage.usedBytes, usage.limitBytes)}%、ファイル形式別内訳`}
          >
            {usage.formatBreakdown?.map((item) => (
              <Progress.Section
                key={item.format}
                value={usagePercent(item.sizeBytes, usage.limitBytes)}
                color={formatColors[item.format] ?? "gray"}
                aria-label={`${item.format} ${usagePercent(item.sizeBytes, usage.limitBytes)}%`}
              />
            )) ?? (
              <Progress.Section
                value={usagePercent(usage.usedBytes, usage.limitBytes)}
                color="blue"
              />
            )}
          </Progress.Root>
        )}
        <Group justify="space-between" align="center" wrap="wrap">
          <Text size="sm">総容量</Text>
          {status === "loading" ? (
            <Skeleton w={92} h={16} radius="sm" />
          ) : (
            <StorageValue bytes={usage.limitBytes} percent={100} fileSizeUnit={fileSizeUnit} />
          )}
        </Group>
      </Stack>
    </Box>
  )
}

