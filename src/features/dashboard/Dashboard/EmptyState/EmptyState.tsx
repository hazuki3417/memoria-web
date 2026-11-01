import { Button, Center, Group, Stack, Text } from "@mantine/core"
import { IconFolder, IconPhoto } from "@tabler/icons-react"
import Link from "next/link"

export function EmptyState({
  kind,
  href,
}: {
  kind: "media" | "group"
  href: string
}) {
  const media = kind === "media"
  return (
    <Center
      mih={132}
      px="md"
      style={{
        border: "1px solid var(--mantine-color-default-border)",
        borderRadius: "var(--mantine-radius-md)",
      }}
    >
      <Stack align="center" gap={8}>
        <Group gap={6}>
          {media ? (
            <IconPhoto size={20} stroke={1.5} />
          ) : (
            <IconFolder size={20} stroke={1.5} />
          )}
          <Text size="sm" c="dimmed" fw={500}>
            {media ? "メディアはまだありません" : "Groupはまだありません"}
          </Text>
        </Group>
        <Button component={Link} href={href} variant="subtle" size="compact-sm">
          {media ? "メディアへ移動" : "Groupへ移動"}
        </Button>
      </Stack>
    </Center>
  )
}
