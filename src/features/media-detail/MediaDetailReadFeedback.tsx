"use client"

import { Button, Center, Group, Loader, Skeleton, Stack, Text } from "@mantine/core"
import type {
  CollectionReadState,
  DetailReadState,
  PreviewReadState,
} from "./mediaDetailReadState"

export function PreviewStatus({
  state,
  onRetry,
}: {
  state: Exclude<PreviewReadState, { kind: "ready" }>
  onRetry?: () => void
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
        {(state.kind === "detail-loading" || state.kind === "image-loading" || state.kind === "processing") && <Loader size="sm" />}
        <Text size="sm" c="dimmed">{messages[state.kind]}</Text>
        {(state.kind === "detail-error" || state.kind === "delivery-error") && onRetry && (
          <Button size="xs" variant="light" onClick={onRetry}>再試行</Button>
        )}
      </Stack>
    </Center>
  )
}

export function DetailMetadataStatus({
  state,
  onRetry,
}: {
  state: DetailReadState
  onRetry?: () => void
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
  const rows = [
    ["ファイルサイズ", `${media.fileSize.toLocaleString()} B`],
    ["サイズ", media.image ? `${media.image.width} × ${media.image.height}` : "-"],
    ["アップロード", media.uploadedAt],
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
}: {
  title: string
  state: CollectionReadState
}) {
  if (state.kind === "ready") return null
  return (
    <Stack gap="xs" role="status" aria-label={`${title}の取得状態`}>
      <Text size="xs" c="dimmed">{title}</Text>
      {state.kind === "pending"
        ? <Skeleton height={18} width="70%" />
        : <Text size="xs" c="dimmed">{state.kind === "incomplete" ? "追加情報を取得中です" : "情報を取得できませんでした"}</Text>}
    </Stack>
  )
}
