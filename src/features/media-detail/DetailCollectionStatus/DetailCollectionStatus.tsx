"use client"

import { Button, Skeleton, Stack, Text } from "@mantine/core"
import type { CollectionReadState } from "../mediaDetailReadState"

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
      <Text size="xs" c="dimmed">
        {title}
      </Text>
      {state.kind === "pending" ? (
        <Skeleton height={18} width="70%" />
      ) : (
        <Text size="xs" c="dimmed">
          {state.kind === "incomplete"
            ? "追加情報を取得中、または取得が停止しています"
            : "情報を取得できませんでした"}
        </Text>
      )}
      {(state.kind === "incomplete" || state.kind === "error") && onRetry && (
        <Button size="xs" variant="light" onClick={onRetry}>
          再試行
        </Button>
      )}
    </Stack>
  )
}
