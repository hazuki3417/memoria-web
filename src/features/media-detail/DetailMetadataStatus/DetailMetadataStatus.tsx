"use client"

import { Button, Group, Skeleton, Stack, Text } from "@mantine/core"
import { formatFileSize } from "@/features/usage/formatFileSize"
import { formatMediaDetailDate } from "../formatMediaDetailDate"
import type { DetailReadState } from "../mediaDetailReadState"

export function DetailMetadataStatus({
  state,
  onRetry,
  dateFormat = "YYYY_MM_DD",
  fileSizeUnit = "DECIMAL",
}: {
  state: DetailReadState
  onRetry?: () => void
  dateFormat?: "YYYY_MM_DD" | "MM_DD_YYYY" | "DD_MM_YYYY"
  fileSizeUnit?: "DECIMAL" | "BINARY"
}) {
  if (state.kind === "loading" || state.kind === "idle") {
    return (
      <Stack gap="xs" role="status" aria-label="基本情報を読み込み中">
        <Skeleton height={12} width="75%" />
        <Skeleton height={12} width="85%" />
        <Skeleton height={12} width="65%" />
        <Skeleton height={12} width="80%" />
      </Stack>
    )
  }
  if (state.kind !== "ready") {
    return (
      <Stack gap="xs" role="status">
        <Text size="xs" c="dimmed">
          {state.kind === "unavailable"
            ? "Mediaを表示できません"
            : "Media情報を取得できませんでした"}
        </Text>
        {state.kind === "retryable-error" && onRetry && (
          <Button size="xs" variant="light" onClick={onRetry}>
            再試行
          </Button>
        )}
      </Stack>
    )
  }
  const { media } = state
  const size = formatFileSize(media.fileSize, fileSizeUnit)
  const rows = [
    ["ファイルサイズ", `${size.value} ${size.unit}`],
    [
      "サイズ",
      media.image ? `${media.image.width} × ${media.image.height}` : "-",
    ],
    ["アップロード", formatMediaDetailDate(media.uploadedAt, dateFormat)],
    ["Uploader", media.uploadedBy?.nickname ?? "-"],
  ]
  return (
    <Stack gap="xs">
      {rows.map(([label, value]) => (
        <Group key={label} justify="space-between">
          <Text size="xs" c="dimmed">
            {label}
          </Text>
          <Text size="xs">{value}</Text>
        </Group>
      ))}
    </Stack>
  )
}
