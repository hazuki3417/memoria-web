"use client"

import { Box, Group, Progress, Skeleton, Stack, Text } from "@mantine/core"
import { SectionHeader } from "@/components/SectionHeader"
import { formatUsageBytes, usagePercent, type FileSizeUnit } from "./usageSize"
import { usageFormatColors as formatColors } from "./usageFormatColors"
import type { SettingsUsageData, UsageStatus } from "./usageTypes"

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
            <Text size="sm" ta="right">
              {formatUsageBytes(usage.usedBytes, fileSizeUnit)}{` ( ${usagePercent(usage.usedBytes, usage.limitBytes)} % )`}
            </Text>
          )}
        </Group>
        <Group justify="space-between" align="center" wrap="wrap">
          <Text size="sm">空き容量</Text>
          {status === "loading" ? (
            <Skeleton w={92} h={16} radius="sm" />
          ) : (
            <Text size="sm" ta="right">
              {formatUsageBytes(Math.max(0, usage.limitBytes - usage.usedBytes), fileSizeUnit)}{` ( ${Math.max(0, 100 - usagePercent(usage.usedBytes, usage.limitBytes)).toFixed(1).replace(/\.0$/, "")} % )`}
            </Text>
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
            <Text size="sm" ta="right">
              {formatUsageBytes(usage.limitBytes, fileSizeUnit)} ( 100 % )
            </Text>
          )}
        </Group>
      </Stack>
    </Box>
  )
}

