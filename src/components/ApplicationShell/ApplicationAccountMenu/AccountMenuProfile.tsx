import { Avatar, Box, Group, Text } from "@mantine/core"

type AccountMenuProfileProps = {
  displayName: string
  avatarLabel?: string
  contextLabel: string
}

export function AccountMenuProfile({
  displayName,
  avatarLabel,
  contextLabel,
}: AccountMenuProfileProps) {
  return (
    <Group gap="sm" px="xs" py="xs" wrap="nowrap">
      <Avatar size={32} radius="xl">
        {avatarLabel ?? displayName.slice(0, 1)}
      </Avatar>
      <Box>
        <Text size="sm" fw={600} lh={1.2}>
          {displayName}
        </Text>
        <Text size="xs" c="dimmed" lh={1.2}>
          {contextLabel}
        </Text>
      </Box>
    </Group>
  )
}
