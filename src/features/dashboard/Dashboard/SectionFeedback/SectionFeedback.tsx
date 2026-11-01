import { Button, Center, Stack, Text } from "@mantine/core"

export function SectionFeedback({
  state,
  onRetry,
  kind,
}: {
  state: "loading" | "error"
  onRetry?: () => void
  kind: "media" | "group"
}) {
  return (
    <Center mih={132}>
      {state === "loading" ? (
        <Text size="sm" c="dimmed" role="status">
          読み込み中です
        </Text>
      ) : (
        <Stack gap="xs" align="center" role="alert">
          <Text size="sm" c="dimmed">
            {kind === "media" ? "メディア" : "Group"}を取得できませんでした
          </Text>
          <Button variant="subtle" size="compact-sm" onClick={onRetry}>
            再試行
          </Button>
        </Stack>
      )}
    </Center>
  )
}
