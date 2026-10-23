"use client"

import { useMemo } from "react"
import { Box, Group, Skeleton, Table, Text, UnstyledButton } from "@mantine/core"
import { SectionHeader } from "@/components/SectionHeader"
import { sortUsageFormats, type UsageSort, type UsageSortKey } from "./sortUsageFormats"
import type { FileSizeUnit } from "./formatFileSize"
import { UsageFileSize } from "./UsageFileSize"
import { usagePercent } from "./usagePercent"
import { usageFormatColors as formatColors } from "./usageFormatColors"
import type { SettingsUsageData, UsageStatus } from "./usageTypes"

export function UsageFormatBreakdownSection({
  usage,
  status,
  sort,
  onSort,
  fileSizeUnit,
}: {
  usage: SettingsUsageData
  status: UsageStatus
  sort: UsageSort
  onSort: (key: UsageSortKey) => void
  fileSizeUnit: FileSizeUnit
}) {
  const sortedBreakdown = useMemo(
    () => sortUsageFormats(usage.formatBreakdown ?? [], sort),
    [usage.formatBreakdown, sort],
  )
  const ariaSort = (key: UsageSortKey): "ascending" | "descending" | "none" => {
    if (sort?.key !== key) return "none"
    return sort.direction === "asc" ? "ascending" : "descending"
  }
  const sortHeader = (key: UsageSortKey, label: string) => (
    <UnstyledButton
      onClick={() => onSort(key)}
      disabled={status !== "ready"}
      aria-label={`${label}で並べ替え`}
      style={{
        font: "inherit",
        fontWeight: "inherit",
        width: "100%",
        textAlign: key === "format" ? "left" : "right",
      }}
    >
      {label}{" "}
      <Text span size="xs" c="dimmed" aria-hidden="true">
        {sort?.key === key ? (sort.direction === "asc" ? "▲" : "▼") : "↕"}
      </Text>
    </UnstyledButton>
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
                <Table.Th
                  ta="right"
                  aria-sort={ariaSort("size")}
                >
                  {sortHeader("size", "使用量")}
                </Table.Th>
                <Table.Th
                  ta="right"
                  aria-sort={ariaSort("percent")}
                >
                  {sortHeader("percent", "割合")}
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {status === "loading" && Array.from({ length: 4 }, (_, row) => (
                <Table.Tr key={`loading-${row}`}>
                  {Array.from({ length: 4 }, (_, column) => (
                    <Table.Td key={column}>
                      <Skeleton h={16} radius="sm" />
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))}
              {status === "ready" && sortedBreakdown.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Text size="sm" c="dimmed" ta="center" py="md">
                      登録済みのオリジナルファイルはありません
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
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
                  <Table.Td ta="right"><UsageFileSize bytes={item.sizeBytes} fileSizeUnit={fileSizeUnit} /></Table.Td>
                  <Table.Td ta="right">{usagePercent(item.sizeBytes, usage.limitBytes)} %</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
            {status === "ready" && (
              <Table.Tfoot
                style={{
                  borderTop: "2px solid var(--mantine-color-default-border)",
                }}
              >
                <Table.Tr>
                  <Table.Th>合計</Table.Th>
                  <Table.Th ta="right">
                  {usage.mediaCount.toLocaleString("ja-JP")} 件
                  </Table.Th>
                  <Table.Th ta="right"><UsageFileSize bytes={usage.usedBytes} fileSizeUnit={fileSizeUnit} /></Table.Th>
                  <Table.Th ta="right">{usagePercent(usage.usedBytes, usage.limitBytes)} %</Table.Th>
                </Table.Tr>
              </Table.Tfoot>
            )}
          </Table>
        </Box>
      )}
    </>
  )
}

