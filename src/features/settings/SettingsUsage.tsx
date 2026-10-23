"use client"

import { useMemo, useState } from "react"
import {
  Box,
  Button,
  Group,
  Progress,
  Skeleton,
  Stack,
  Table,
  Text,
  UnstyledButton,
} from "@mantine/core"
import { FeedbackAlert } from "@/components/Feedback"
import { PageHeader } from "@/components/PageHeader"
import { SectionHeader } from "@/components/SectionHeader"
import { sortUsageFormats, type UsageFormatItem, type UsageSort, type UsageSortKey } from "./sortUsageFormats"

export type SettingsUsageData = {
  usedStorageLabel: string
  effectiveLimitLabel: string
  availableStorageLabel: string
  storageUsagePercent: number
  mediaCount: number
  formatBreakdown?: UsageFormatItem[]
}

const formatColors: Record<string, string> = {
  JPEG: "blue",
  PNG: "teal",
  WebP: "violet",
  "HEIC / HEIF": "orange",
}

type UsageStatus = "ready" | "loading" | "error"

function UsageStorageSection({
  usage,
  status,
}: {
  usage: SettingsUsageData
  status: UsageStatus
}) {
  return (
    <Box>
        <SectionHeader>ストレージ</SectionHeader>
        <Stack gap="sm">
          <Group justify="space-between" align="center" wrap="wrap">
            <Text size="sm">使用済み</Text>
            {status === "loading" ? <Skeleton w={92} h={16} radius="sm" /> : <Text size="sm" ta="right">{usage.usedStorageLabel}{` ( ${usage.storageUsagePercent} % )`}</Text>}
          </Group>
          <Group justify="space-between" align="center" wrap="wrap">
            <Text size="sm">空き容量</Text>
            {status === "loading" ? <Skeleton w={92} h={16} radius="sm" /> : <Text size="sm" ta="right">{usage.availableStorageLabel}{` ( ${Math.max(0, 100 - usage.storageUsagePercent).toFixed(1).replace(/\.0$/, "")} % )`}</Text>}
          </Group>
          {status === "loading" ? <Skeleton h={12} radius="xl" /> : <Progress.Root
            size="md"
            aria-label={`ストレージ使用率 ${usage.storageUsagePercent}%、ファイル形式別内訳`}
          >
            {usage.formatBreakdown?.map((item) => (
              <Progress.Section
                key={item.format}
                value={item.capacityPercent}
                color={formatColors[item.format] ?? "gray"}
                aria-label={`${item.format} ${item.capacityPercent}%`}
              />
            )) ?? (
              <Progress.Section
                value={usage.storageUsagePercent}
                color="blue"
              />
            )}
          </Progress.Root>}
          <Group justify="space-between" align="center" wrap="wrap">
            <Text size="sm">総容量</Text>
            {status === "loading" ? <Skeleton w={92} h={16} radius="sm" /> : (
              <Text size="sm" ta="right">{usage.effectiveLimitLabel} ( 100 % )</Text>
            )}
          </Group>
        </Stack>
      </Box>
  )
}

function UsageFormatBreakdownSection({
  usage,
  status,
  sort,
  onSort,
}: {
  usage: SettingsUsageData
  status: UsageStatus
  sort: UsageSort
  onSort: (key: UsageSortKey) => void
}) {
  const sortedBreakdown = useMemo(
    () => sortUsageFormats(usage.formatBreakdown ?? [], sort),
    [usage.formatBreakdown, sort],
  )
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
                  aria-sort={
                    sort?.key === "format"
                      ? sort.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  {sortHeader("format", "形式")}
                </Table.Th>
                <Table.Th
                  ta="right"
                  aria-sort={
                    sort?.key === "count"
                      ? sort.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  {sortHeader("count", "登録件数")}
                </Table.Th>
                <Table.Th
                  ta="right"
                  aria-sort={
                    sort?.key === "size"
                      ? sort.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  {sortHeader("size", "使用量")}
                </Table.Th>
                <Table.Th
                  ta="right"
                  aria-sort={
                    sort?.key === "percent"
                      ? sort.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
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
                  <Table.Td ta="right">{item.sizeLabel}</Table.Td>
                  <Table.Td ta="right">{item.capacityPercent} %</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
            {status === "ready" && <Table.Tfoot
              style={{
                borderTop: "2px solid var(--mantine-color-default-border)",
              }}
            >
              <Table.Tr>
                <Table.Th>合計</Table.Th>
                <Table.Th ta="right">
                  {usage.mediaCount.toLocaleString("ja-JP")} 件
                </Table.Th>
                <Table.Th ta="right">{usage.usedStorageLabel}</Table.Th>
                <Table.Th ta="right">{usage.storageUsagePercent} %</Table.Th>
              </Table.Tr>
            </Table.Tfoot>}
          </Table>
        </Box>
      )}
    </>
  )
}

function UsageErrorContent({ onRetry }: { onRetry?: () => void }) {
  return (
        <Box role="region" aria-label="利用状況の取得エラー">
          <Stack gap="md" align="flex-start">
            <FeedbackAlert kind="error" title="利用状況を取得できませんでした" role="alert">
              通信状況を確認して、もう一度お試しください。
            </FeedbackAlert>
            {onRetry && (
              <Button size="sm" variant="light" onClick={onRetry}>
                再試行
              </Button>
            )}
          </Stack>
        </Box>
  )
}

export function SettingsUsage({
  usage,
  scope = "personal",
  status = "ready",
  onRetry,
}: {
  usage: SettingsUsageData
  scope?: "personal" | "community"
  status?: UsageStatus
  onRetry?: () => void
}) {
  const [sort, setSort] = useState<UsageSort>(null)
  const toggleSort = (key: UsageSortKey) => {
    setSort((current) => ({
      key,
      direction:
        current?.key === key && current.direction === "asc" ? "desc" : "asc",
    }))
  }
  return (
    <Stack gap="xl">
      <PageHeader
        title="利用状況"
        description={
          scope === "community"
            ? "このCommunityが管理する登録済みオリジナルファイルの使用状況を確認します。"
            : "Personal Mediaの登録済みオリジナルファイルの使用状況を確認します。"
        }
      />
      <Box>
      {status === "error" ? (
        <Box role="region" aria-label="利用状況の取得エラー">
          <Stack gap="md" align="flex-start">
            <FeedbackAlert kind="error" title="利用状況を取得できませんでした" role="alert">
              通信状況を確認して、もう一度お試しください。
            </FeedbackAlert>
            {onRetry && (
              <Button size="sm" variant="light" onClick={onRetry}>
                再試行
              </Button>
            )}
          </Stack>
        </Box>
      ) : (
      <Stack
        gap="xl"
        role={status === "loading" ? "status" : undefined}
        aria-label={status === "loading" ? "利用状況を読み込んでいます" : undefined}
      >
      <UsageStorageSection usage={usage} status={status} />
      <UsageFormatBreakdownSection
        usage={usage}
        status={status}
        sort={sort}
        onSort={toggleSort}
      />
      </Stack>
      )}
      </Box>
    </Stack>
  )
}
