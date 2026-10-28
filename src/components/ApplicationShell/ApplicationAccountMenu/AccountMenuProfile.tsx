import { Avatar, Box, Group, Skeleton, Text } from "@mantine/core"
import { IconUser } from "@tabler/icons-react"

type AccountMenuProfileProps = {
  displayName: string
  avatarLabel?: string
  contextLabel: string
  status?: "ready" | "loading" | "error"
}

export function AccountMenuProfile({
  displayName,
  avatarLabel,
  contextLabel,
  status = "ready",
}: AccountMenuProfileProps) {
  return (
    <Group gap="sm" px="xs" py="xs" wrap="nowrap">
      {status === "loading" ? (
        <Skeleton circle height={32} aria-label="ユーザー情報を読み込み中" />
      ) : (
        <Avatar size={32} radius="xl">
          {status === "error" ? (
            <IconUser size={18} aria-hidden="true" />
          ) : (
            avatarLabel ?? displayName.slice(0, 1)
          )}
        </Avatar>
      )}
      <Box>
        {status === "loading" ? (
          <Skeleton
            height={14}
            width={112}
            mb={6}
            aria-label="ユーザー名を読み込み中"
          />
        ) : (
          <Text size="sm" fw={600} lh={1.2}>
            {status === "error"
              ? "ユーザー情報を取得できませんでした"
              : displayName}
          </Text>
        )}
        <Text size="xs" c="dimmed" lh={1.2}>
          {contextLabel}
        </Text>
      </Box>
    </Group>
  )
}
