"use client"

import { Button, Center, Stack, Text, ThemeIcon, Title, Box } from "@mantine/core"
import { IconUsers } from "@tabler/icons-react"

/** Neutral UI: non-members and nonexistent Communities share one public state. */
export function CommunityAccessUnavailable({
  onReturnToDashboard,
}: {
  onReturnToDashboard: () => void
}) {
  return (
    <Box w="100%" mih={320} px={{ base: "md", sm: "xl" }} py="xl">
      <Center mih={272}>
        <Stack align="center" gap="sm" maw={440} role="status">
          <ThemeIcon
            size={56}
            radius="xl"
            variant="light"
            color="gray"
            aria-hidden="true"
          >
            <IconUsers size={28} stroke={1.6} />
          </ThemeIcon>
          <Title order={3} size="h4" ta="center" mt="xs">
            このCommunityを表示できません
          </Title>
          <Text size="sm" c="dimmed" ta="center">
            このCommunityは存在しないか、現在アクセスできません。
          </Text>
          <Button onClick={onReturnToDashboard}>ダッシュボードへ戻る</Button>
        </Stack>
      </Center>
    </Box>
  )
}
