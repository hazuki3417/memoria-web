"use client"

import { Alert, Box, Button, Group, Stack, Text } from "@mantine/core"

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
        <Alert color="red" title="Groupの関係候補を取得できませんでした">
          <Stack gap="xs">
            <Text size="sm">
              関係の編集に必要な候補を取得できませんでした。GroupとMediaの閲覧は継続できます。
            </Text>
            <Group justify="flex-start">
              <Button size="xs" variant="light" onClick={() => void onRetry?.()}>
                再試行
              </Button>
            </Group>
          </Stack>
        </Alert>
      ) : (
        <Text size="xs" c="dimmed" role="status">
          関係の編集候補を取得しています
        </Text>
      )}
    </Box>
  ) : null
}
