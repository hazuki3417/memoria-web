"use client"

import { Box, Text } from "@mantine/core"
import { ErrorState } from "@/components/ErrorState"

export function GroupRelationCandidateFeedback({
  canManage,
  hasSelection,
  state,
  onRetry,
}: {
  canManage: boolean
  hasSelection: boolean
  state: "ready" | "loading" | "error"
  onRetry?: () => Promise<void>
}) {
  return canManage && hasSelection && state !== "ready" ? (
    <Box px="sm" py="xs">
      {state === "error" ? (
        <ErrorState variant="inline" title="Groupの関係候補を取得できませんでした" description="関係の編集に必要な候補を取得できませんでした。GroupとMediaの閲覧は継続できます。" onRetry={() => void onRetry?.()} />
      ) : (
        <Text size="xs" c="dimmed" role="status">
          関係の編集候補を取得しています
        </Text>
      )}
    </Box>
  ) : null
}
