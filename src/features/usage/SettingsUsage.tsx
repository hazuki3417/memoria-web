"use client"

import { useState } from "react"
import { IconDatabase, IconPercentage } from "@tabler/icons-react"
import {
  Box,
  Button,
  Group,
  SegmentedControl,
  Stack,
  Text,
  VisuallyHidden,
} from "@mantine/core"
import { FeedbackAlert } from "@/components/Feedback"
import { PageHeader } from "@/components/PageHeader"
import type { FileSizeUnit } from "./formatFileSize"
import { UsageStorageSection } from "./UsageStorageSection"
import { UsageFormatBreakdownSection } from "./UsageFormatBreakdownSection"
import type { SettingsUsageData, UsageStatus } from "./usageTypes"
import type { UsageDisplayMode } from "./usageDisplayMode"
export type { SettingsUsageData } from "./usageTypes"
import {
  defaultUsageSort,
  nextUsageSort,
  type UsageSort,
  type UsageSortKey,
} from "./sortUsageFormats"

function UsageErrorContent({ onRetry }: { onRetry?: () => void }) {
  return (
    <Box role="region" aria-label="利用状況の取得エラー">
      <Stack gap="md" align="flex-start">
        <FeedbackAlert
          kind="error"
          title="利用状況を取得できませんでした"
          role="alert"
        >
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
  fileSizeUnit = "DECIMAL",
}: {
  usage: SettingsUsageData
  scope?: "personal" | "community"
  status?: UsageStatus
  onRetry?: () => void
  fileSizeUnit?: FileSizeUnit
}) {
  const [sort, setSort] = useState<UsageSort>(defaultUsageSort)
  const [displayMode, setDisplayMode] = useState<UsageDisplayMode>("size")
  const toggleSort = (key: UsageSortKey) => {
    setSort((current) => nextUsageSort(current, key))
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
        {status === "error" ? (
          <UsageErrorContent onRetry={onRetry} />
        ) : (
          <Stack
            gap="xl"
            role={status === "loading" ? "status" : undefined}
            aria-label={
              status === "loading" ? "利用状況を読み込んでいます" : undefined
            }
          >
            <UsageStorageSection
              usage={usage}
              status={status}
              fileSizeUnit={fileSizeUnit}
              displayMode={displayMode}
            />
            <UsageFormatBreakdownSection
              usage={usage}
              status={status}
              sort={sort}
              onSort={toggleSort}
              fileSizeUnit={fileSizeUnit}
              displayMode={displayMode}
            />
          </Stack>
        )}
      </Box>
    </Stack>
  )
}
