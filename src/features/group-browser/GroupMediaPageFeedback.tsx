"use client"

import { Box, Center, Loader, Stack, Text } from "@mantine/core"
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
    <Center py="md" role="status">
      <Stack align="center" gap="xs">
        <Loader size="sm" />
        <Text size="xs" c="dimmed">
          追加のMediaを取得しています
        </Text>
      </Stack>
    </Center>
  ) : null
}
