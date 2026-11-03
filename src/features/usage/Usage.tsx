"use client"

import { useState } from "react"
import { IconDatabase, IconPercentage } from "@tabler/icons-react"
import {
  Box,
  Button,
  Center,
  Group,
  SegmentedControl,
  Stack,
  Text,
  VisuallyHidden,
} from "@mantine/core"
import { PageStatusBoundary } from "@/components/PageStatusBoundary/PageStatusBoundary"
import { PageHeader } from "@/components/PageHeader"
import type { FileSizeUnit } from "./formatFileSize"
import { UsageStorageSection } from "./UsageStorageSection"
import { UsageFormatBreakdownSection } from "./UsageFormatBreakdownSection"
import type { UsageData, UsageStatus } from "./usageTypes"
import type { UsageDisplayMode } from "./usageDisplayMode"
export type { UsageData } from "./usageTypes"
import {
  defaultUsageSort,
  nextUsageSort,
  type UsageSort,
  type UsageSortKey,
} from "./sortUsageFormats"

export function Usage({
  usage,
  scope = "personal",
  status = "ready",
  fileSizeUnit = "DECIMAL",
  onRetry,
}: {
  usage: UsageData
  scope?: "personal" | "community"
  status?: UsageStatus
  fileSizeUnit?: FileSizeUnit
  onRetry?: () => void
}) {
  const [sort, setSort] = useState<UsageSort>(defaultUsageSort)
  const [displayMode, setDisplayMode] = useState<UsageDisplayMode>("size")
  const toggleSort = (key: UsageSortKey) => {
    setSort((current) => nextUsageSort(current, key))
  }
  if (status !== "ready") {
    return (
      <>
        <PageStatusBoundary
          state={status}
          label="利用状況を読み込み中"
          errorTitle={onRetry ? "利用状況を取得できませんでした" : undefined}
        >
          {null}
        </PageStatusBoundary>
        {status === "error" && onRetry && (
          <Center>
            <Button variant="light" onClick={onRetry}>
              再試行
            </Button>
          </Center>
        )}
      </>
    )
  }
  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
        <PageHeader
          title="利用状況"
          description={
            scope === "community"
              ? "このCommunityが管理する登録済みオリジナルファイルの使用状況を確認します。"
              : "Personal Mediaの登録済みオリジナルファイルの使用状況を確認します。"
          }
        />
        <Group gap="xs" wrap="nowrap">
          <Text size="sm" c="dimmed" id="usage-display-mode-label">
            表示
          </Text>
          <SegmentedControl
            size="xs"
            aria-labelledby="usage-display-mode-label"
            value={displayMode}
            onChange={(value) => setDisplayMode(value as UsageDisplayMode)}
            data={[
              {
                value: "size",
                label: (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconDatabase
                      size={15}
                      stroke={1.75}
                      aria-hidden="true"
                      style={{ display: "block" }}
                    />
                    <VisuallyHidden>容量</VisuallyHidden>
                  </span>
                ),
              },
              {
                value: "percent",
                label: (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: 18,
                    }}
                  >
                    <IconPercentage
                      size={15}
                      stroke={1.75}
                      aria-hidden="true"
                      style={{ display: "block" }}
                    />
                    <VisuallyHidden>割合</VisuallyHidden>
                  </span>
                ),
              },
            ]}
          />
        </Group>
      </Group>
      <Box>
        <Stack gap="xl">
          <UsageStorageSection
            usage={usage}
            status="ready"
            fileSizeUnit={fileSizeUnit}
            displayMode={displayMode}
          />
          <UsageFormatBreakdownSection
            usage={usage}
            status="ready"
            sort={sort}
            onSort={toggleSort}
            fileSizeUnit={fileSizeUnit}
            displayMode={displayMode}
          />
        </Stack>
      </Box>
    </Stack>
  )
}
