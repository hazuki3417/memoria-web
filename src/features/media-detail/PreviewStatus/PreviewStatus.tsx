"use client"

import { Button, Center, Loader, Stack, Text } from "@mantine/core"
import type { PreviewReadState } from "../mediaDetailReadState"

export function PreviewStatus({
  state,
  onRetry,
  pollingStopped = false,
}: {
  state: Exclude<PreviewReadState, { kind: "ready" }>
  onRetry?: () => void
  pollingStopped?: boolean
}) {
  const messages: Record<
    Exclude<PreviewReadState, { kind: "ready" }>["kind"],
    string
  > = {
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
        {(state.kind === "detail-loading" ||
          state.kind === "image-loading" ||
          (state.kind === "processing" && !pollingStopped)) && (
          <Loader size="sm" />
        )}
        <Text size="sm" c="dimmed">
          {state.kind === "processing" && pollingStopped
            ? "処理状態を取得できませんでした"
            : messages[state.kind]}
        </Text>
        {(state.kind === "detail-error" ||
          state.kind === "delivery-error" ||
          (state.kind === "processing" && pollingStopped)) &&
          onRetry && (
            <Button size="xs" variant="light" onClick={onRetry}>
              {state.kind === "processing" ? "監視を再開" : "再試行"}
            </Button>
          )}
      </Stack>
    </Center>
  )
}
