import { Badge, Group, Text } from "@mantine/core"

export function RelationItems({ names }: { names: string[] }) {
  if (names.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        なし
      </Text>
    )
  }
  return (
    <Group gap={6}>
      {[...names].sort().map((name) => (
        <Badge key={name} variant="light">
          {name}
        </Badge>
      ))}
    </Group>
  )
}
