"use client"

import { Box, Group, Progress, Stack, Text } from "@mantine/core"
import { SectionHeader } from "@/components/SectionHeader"
import type { FileSizeUnit } from "../formatFileSize"
import { UsageFileSize } from "../UsageFileSize"
import { usagePercent } from "../usagePercent"
import { defaultUsageSort, sortUsageFormats } from "../sortUsageFormats"
import { usageFormatColors as formatColors } from "../usageFormatColors"
import type { UsageData } from "../usageTypes"
import type { UsageDisplayMode } from "../usageDisplayMode"

export function UsageStorageSection({
  usage,
  fileSizeUnit,
  displayMode = "size",
}: {
  usage: UsageData
  fileSizeUnit: FileSizeUnit
  displayMode?: UsageDisplayMode
}) {
  return (
    <Box>
      <SectionHeader>ストレージ</SectionHeader>
      <Stack gap="sm">
        <Group justify="space-between" align="center" wrap="wrap">
          <Text size="sm">使用済み</Text>
          <Text size="sm" ta="right">
            {displayMode === "size" ? (
              <UsageFileSize
                bytes={usage.usedBytes}
                fileSizeUnit={fileSizeUnit}
              />
            ) : (
              `${usagePercent(usage.usedBytes, usage.limitBytes)}%`
            )}
          </Text>
        </Group>
        <Group justify="space-between" align="center" wrap="wrap">
          <Text size="sm">空き容量</Text>
          <Text size="sm" ta="right">
            {displayMode === "size" ? (
              <UsageFileSize
                bytes={Math.max(0, usage.limitBytes - usage.usedBytes)}
                fileSizeUnit={fileSizeUnit}
              />
            ) : (
              `${Math.max(
                0,
                100 - usagePercent(usage.usedBytes, usage.limitBytes),
              )
                .toFixed(1)
                .replace(/\.0$/, "")}%`
            )}
          </Text>
        </Group>
        <Progress.Root
          size="md"
          aria-label={`ストレージ使用率 ${usagePercent(usage.usedBytes, usage.limitBytes)}%、ファイル形式別内訳`}
        >
          {(usage.formatBreakdown &&
            sortUsageFormats(usage.formatBreakdown, defaultUsageSort).map(
              (item) => (
                <Progress.Section
                  key={item.format}
                  value={usagePercent(item.sizeBytes, usage.limitBytes)}
                  color={formatColors[item.format] ?? "gray"}
                  aria-label={`${item.format} ${usagePercent(item.sizeBytes, usage.limitBytes)}%`}
                />
              ),
            )) ?? (
            <Progress.Section
              value={usagePercent(usage.usedBytes, usage.limitBytes)}
              color="blue"
            />
          )}
        </Progress.Root>
        <Group justify="space-between" align="center" wrap="wrap">
          <Text size="sm">容量上限</Text>
          <Text size="sm" ta="right">
            <UsageFileSize
              bytes={usage.limitBytes}
              fileSizeUnit={fileSizeUnit}
            />
          </Text>
        </Group>
      </Stack>
    </Box>
  )
}
