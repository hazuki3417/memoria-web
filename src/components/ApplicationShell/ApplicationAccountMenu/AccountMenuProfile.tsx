import { Avatar, Box, Group, Skeleton, Text } from "@mantine/core"
import { IconUser } from "@tabler/icons-react"

export type AccountMenuProfileState =
  | { status: "loading" }
  | {
      status: "ready"
      displayName: string
      avatarLabel?: string
      contextLabel: string
    }
  | { status: "error" }

type AccountMenuProfileProps = {
  state: AccountMenuProfileState
}

export function AccountMenuProfile({ state }: AccountMenuProfileProps) {
  const loading = state.status === "loading"
  const ready = state.status === "ready"

  return (
    <Group
      gap="sm"
      px="xs"
      py="xs"
      wrap="nowrap"
      aria-busy={loading}
      aria-label={loading ? "プロフィールを読み込み中" : undefined}
    >
      <Skeleton visible={loading} circle>
        <Avatar size={32} radius="xl">
          {ready ? (
            state.avatarLabel ?? state.displayName.slice(0, 1)
          ) : (
            <IconUser size={18} aria-hidden="true" />
          )}
        </Avatar>
      </Skeleton>
      <Box>
        <Skeleton visible={loading}>
          <Text size="sm" fw={600} lh={1.2} w={loading ? 112 : undefined}>
            {ready
              ? state.displayName
              : loading
                ? "\u00a0"
                : "ユーザー情報を取得できませんでした"}
          </Text>
        </Skeleton>
        <Skeleton visible={loading}>
          <Text size="xs" c="dimmed" lh={1.2} w={loading ? 68 : undefined}>
            {ready
              ? state.contextLabel
              : loading
                ? "\u00a0"
                : "再読み込みしてお試しください"}
          </Text>
        </Skeleton>
      </Box>
    </Group>
  )
}
