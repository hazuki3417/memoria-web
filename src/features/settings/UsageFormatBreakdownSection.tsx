"use client"

import { useMemo } from "react"
import { Box, Group, Skeleton, Table, Text } from "@mantine/core"
import { SectionHeader } from "@/components/SectionHeader"
import { sortUsageFormats, type UsageSort, type UsageSortKey } from "./sortUsageFormats"
import type { FileSizeUnit } from "./formatFileSize"
import { UsageFileSize } from "./UsageFileSize"
import { UsageSortHeader } from "./UsageSortHeader"
import { usagePercent } from "./usagePercent"
import { usageFormatColors as formatColors } from "./usageFormatColors"
import type { SettingsUsageData, UsageStatus } from "./usageTypes"
import type { UsageDisplayMode } from "./usageDisplayMode"

// 取得成功の0件でも、分類を省略せず4形式の0件行を表示する。
const zeroFormatBreakdown = [
  { format: "JPEG", count: 0, sizeBytes: 0 },
  { format: "PNG", count: 0, sizeBytes: 0 },
  { format: "WebP", count: 0, sizeBytes: 0 },
  { format: "HEIC / HEIF", count: 0, sizeBytes: 0 },
]

export function UsageFormatBreakdownSection({
  usage,
  status,
  sort,
  onSort,
  fileSizeUnit,
  displayMode = "size",
}: {
  usage: SettingsUsageData
  status: UsageStatus
  sort: UsageSort
  onSort: (key: UsageSortKey) => void
  fileSizeUnit: FileSizeUnit
  displayMode?: UsageDisplayMode
}) {
  const sortedBreakdown = useMemo(
    () => sortUsageFormats(
      usage.mediaCount === 0 && !usage.formatBreakdown?.length
        ? zeroFormatBreakdown
        : usage.formatBreakdown ?? [],
      sort,
    ),
    [usage.mediaCount, usage.formatBreakdown, sort],
  )
  const ariaSort = (key: UsageSortKey): "ascending" | "descending" | "none" => {
    if (sort?.key !== key) return "none"
    return sort.direction === "asc" ? "ascending" : "descending"
  }
  const sortHeader = (key: UsageSortKey, label: string) => (
    <UsageSortHeader
      label={label}
      direction={sort?.key === key ? sort.direction : null}
      align={key === "format" ? "left" : "right"}
      disabled={status !== "ready"}
      onSort={() => onSort(key)}
    />
  )
  return (
    <>
      {(status === "loading" || usage.formatBreakdown) && (
        <Box>
          <SectionHeader>ファイル形式別内訳</SectionHeader>
          <Table striped highlightOnHover={status === "ready"}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th
                  aria-sort={ariaSort("format")}
                >
                  {sortHeader("format", "形式")}
                </Table.Th>
                <Table.Th
                  ta="right"
                  aria-sort={ariaSort("count")}
                >
                  {sortHeader("count", "登録件数")}
                </Table.Th>
                <Table.Th ta="right" aria-sort={ariaSort("size")}>
                  {sortHeader("size", displayMode === "size" ? "使用量" : "割合")}
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {status === "loading" && Array.from({ length: 4 }, (_, row) => (
                <Table.Tr key={`loading-${row}`}>
                  {Array.from({ length: 3 }, (_, column) => (
                    <Table.Td key={column}>
                      <Skeleton h={16} radius="sm" />
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))}
              {status === "ready" && sortedBreakdown.map((item) => (
                <Table.Tr key={item.format}>
                  <Table.Td>
                    <Group gap="xs" wrap="nowrap">
                      <Box
                        w={12}
                        h={12}
                        bg={`var(--mantine-color-${formatColors[item.format] ?? "gray"}-6)`}
                        style={{ flexShrink: 0 }}
                        aria-hidden="true"
                      />
                      <Text size="sm">{item.format}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td ta="right">
                    {item.count.toLocaleString("ja-JP")} 件
                  </Table.Td>
                  <Table.Td ta="right">
                    {displayMode === "size" ? (
                      <UsageFileSize bytes={item.sizeBytes} fileSizeUnit={fileSizeUnit} />
                    ) : (
                      `${usagePercent(item.sizeBytes, usage.limitBytes)} %`
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
            {(status === "ready" || status === "loading") && (
              <Table.Tfoot
                style={{
                  borderTop: "2px solid var(--mantine-color-default-border)",
                }}
              >
                <Table.Tr>
                  <Table.Th>合計</Table.Th>
                  {status === "loading" ? (
                    <>
                      {["count", "value"].map((field) => (
                        <Table.Th key={field} ta="right">
                          <Skeleton h={16} radius="sm" />
                        </Table.Th>
                      ))}
                    </>
                  ) : (
                    <>
                      <Table.Th ta="right">{usage.mediaCount.toLocaleString("ja-JP")} 件</Table.Th>
                      <Table.Th ta="right">
                        {displayMode === "size" ? (
                          <UsageFileSize bytes={usage.usedBytes} fileSizeUnit={fileSizeUnit} />
                        ) : (
                          `${usagePercent(usage.usedBytes, usage.limitBytes)} %`
                        )}
                      </Table.Th>
                    </>
                  )}
                </Table.Tr>
              </Table.Tfoot>
            )}
          </Table>
        </Box>
      )}
    </>
  )
}

