"use client"

import { Alert, Button, Stack, Text } from "@mantine/core"

export function GroupMediaPageFeedback({
  state,
  onRetry,
}: {
  state: "idle" | "loading" | "error"
  onRetry?: () => void
}) {
  return state === "error" ? (
    <Alert color="red" title="追加のMediaを取得できませんでした" mt="sm">
      <Stack gap="xs" align="flex-start">
        <Text size="sm">取得済みのMediaは引き続き閲覧できます。</Text>
        <Button size="xs" variant="light" onClick={onRetry}>
          再試行
        </Button>
      </Stack>
    </Alert>
  ) : state === "loading" ? (
    <Text size="xs" c="dimmed" mt="sm" role="status">
      追加のMediaを取得しています
    </Text>
  ) : null
}
