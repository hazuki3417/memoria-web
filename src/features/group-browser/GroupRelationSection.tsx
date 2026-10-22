"use client"

import { Badge, Box, Collapse, Group, SimpleGrid, Stack, Text, UnstyledButton } from "@mantine/core"
import { IconChevronRight } from "@tabler/icons-react"

function RelationItems({ names }: { names: string[] }) {
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

export function GroupRelationSection({ opened, onToggle, parentNames, childNames }: {
  opened: boolean
  onToggle: () => void
  parentNames: string[]
  childNames: string[]
}) {
  return (
  <>
        <UnstyledButton
          onClick={onToggle}
          px="sm"
          py={6}
          aria-expanded={opened}
          aria-label="このGroupとの関係を開閉"
        >
          <Group gap="xs" wrap="nowrap">
            <IconChevronRight
              size={16}
              style={{
                transform: opened
                  ? "rotate(90deg)"
                  : "rotate(0deg)",
                transition: "transform 200ms ease",
              }}
            />
            <Text size="xs" c="dimmed">
              このGroupとの関係
            </Text>
          </Group>
        </UnstyledButton>
        <Collapse in={opened} transitionDuration={200}>
          <Box px="lg" pb="sm">
            <SimpleGrid cols={2} spacing="lg">
              <Stack gap={4}>
                <Text size="xs" c="dimmed">
                  Parents
                </Text>
                <RelationItems
                  names={parentNames}
                />
              </Stack>
              <Stack gap={4}>
                <Text size="xs" c="dimmed">
                  Children
                </Text>
                <RelationItems names={childNames} />
              </Stack>
            </SimpleGrid>
          </Box>
        </Collapse>
      </>
  )
}
