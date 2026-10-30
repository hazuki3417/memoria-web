"use client"

import { Button, Center, Group, Loader, Skeleton, Stack, Text } from "@mantine/core"
import { formatFileSize } from "@/features/usage/formatFileSize"
import { formatMediaDetailDate } from "./formatMediaDetailDate"
import type {
  CollectionReadState,
  DetailReadState,
  PreviewReadState,
} from "./mediaDetailReadState"

export function PreviewStatus({
  state,
  onRetry,
  pollingStopped = false,
}: {
  state: Exclude<PreviewReadState, { kind: "ready" }>
  onRetry?: () => void
  pollingStopped?: boolean
}) {
  const messages: Record<Exclude<PreviewReadState, { kind: "ready" }>["kind"], string> = {
    idle: "画像を選択してください",
    "detail-loading": "Media情報を読み込んでいます",
    processing: "画像を処理中です",
    "processing-failed": "画像の処理に失敗しました",
    "image-loading": "画像を読み込んでいます",
    unavailable: "Mediaを表示できません",
    "detail-error": "Media情報を取得できませんでした",
    "delivery-error": "画像を表示できません",
  }
  return (
    <Center h="100%" role="status" aria-live="polite">
      <Stack align="center" gap="sm">
        {(state.kind === "detail-loading" || state.kind === "image-loading" || (state.kind === "processing" && !pollingStopped)) && <Loader size="sm" />}
        <Text size="sm" c="dimmed">{state.kind === "processing" && pollingStopped ? "処理状態を取得できませんでした" : messages[state.kind]}</Text>
        {(state.kind === "detail-error" || state.kind === "delivery-error" || (state.kind === "processing" && pollingStopped)) && onRetry && (
          <Button size="xs" variant="light" onClick={onRetry}>{state.kind === "processing" ? "監視を再開" : "再試行"}</Button>
        )}
      </Stack>
    </Center>
  )
}

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
        <Text size="xs" c="dimmed">{state.kind === "unavailable" ? "Mediaを表示できません" : "Media情報を取得できませんでした"}</Text>
        {state.kind === "retryable-error" && onRetry && <Button size="xs" variant="light" onClick={onRetry}>再試行</Button>}
      </Stack>
    )
  }
  const { media } = state
  const size = formatFileSize(media.fileSize, fileSizeUnit)
  const rows = [
    ["ファイルサイズ", `${size.value} ${size.unit}`],
    ["サイズ", media.image ? `${media.image.width} × ${media.image.height}` : "-"],
    ["アップロード", formatMediaDetailDate(media.uploadedAt, dateFormat)],
    ["Uploader", media.uploadedBy?.nickname ?? "-"],
  ]
  return (
    <Stack gap="xs">
      {rows.map(([label, value]) => (
        <Group key={label} justify="space-between">
          <Text size="xs" c="dimmed">{label}</Text>
          <Text size="xs">{value}</Text>
        </Group>
      ))}
    </Stack>
  )
}

export function DetailCollectionStatus({
  title,
  state,
  onRetry,
}: {
  title: string
  state: CollectionReadState
  onRetry?: () => void
}) {
  if (state.kind === "ready") return null
  return (
    <Stack gap="xs" role="status" aria-label={`${title}の取得状態`}>
      <Text size="xs" c="dimmed">{title}</Text>
      {state.kind === "pending"
        ? <Skeleton height={18} width="70%" />
        : <Text size="xs" c="dimmed">{state.kind === "incomplete" ? "追加情報を取得中、または取得が停止しています" : "情報を取得できませんでした"}</Text>}
      {(state.kind === "incomplete" || state.kind === "error") && onRetry && (
        <Button size="xs" variant="light" onClick={onRetry}>再試行</Button>
      )}
    </Stack>
  )
}
