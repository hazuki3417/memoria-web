"use client"

import { Box } from "@mantine/core"
import { LoadingState } from "@/components/LoadingState"
import { ErrorState } from "@/components/ErrorState"

export function GroupMediaPageFeedback({
  state,
  onRetry,
}: {
  state: "idle" | "loading" | "error"
  onRetry?: () => void
}) {
  return state === "error" ? (
    <Box mt="sm">
      <ErrorState variant="inline" title="追加のMediaを取得できませんでした" description="取得済みのMediaは引き続き閲覧できます。" onRetry={onRetry} />
    </Box>
  ) : state === "loading" ? (
    <LoadingState variant="inline" title="追加のMediaを取得しています" />
  ) : null
}
