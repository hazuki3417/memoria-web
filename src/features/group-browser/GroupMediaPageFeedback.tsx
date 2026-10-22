"use client"

import { Alert, Button, Center, Loader, Stack, Text } from "@mantine/core"

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
    <Center py="md" role="status">
      <Stack align="center" gap="xs">
        <Loader size="sm" />
        <Text size="xs" c="dimmed">追加のMediaを取得しています</Text>
      </Stack>
    </Center>
  ) : null
}
