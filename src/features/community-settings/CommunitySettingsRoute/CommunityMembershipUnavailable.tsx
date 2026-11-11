"use client"

import { Box, Button, Center, Stack, Text, ThemeIcon, Title } from "@mantine/core"
import { IconUsers } from "@tabler/icons-react"

/** Access state shared by all Community Settings sections when membership is absent. */
export function CommunityMembershipUnavailable({
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
            このCommunityには所属していません
          </Title>
          <Text size="sm" c="dimmed" ta="center">
            このCommunityの設定を表示するには、Communityへの所属が必要です。
          </Text>
          <Button onClick={onReturnToDashboard}>ダッシュボードへ戻る</Button>
        </Stack>
      </Center>
    </Box>
  )
}
