"use client"

import { Badge, Button, Collapse, Group, Text } from "@mantine/core"
import { IconChevronDown } from "@tabler/icons-react"

export type ImageDetailValueListProps = {
  values: string[]
  variant: "outline" | "light"
  expanded: boolean
  onToggle: () => void
}

export function ImageDetailValueList({ values, variant, expanded, onToggle }: ImageDetailValueListProps) {
  const visible = values.slice(0, 6)
  const renderBadge = (value: string) => (
    <Badge
      key={value}
      variant={variant}
      style={{
        maxWidth: "100%",
        overflowWrap: "anywhere",
        height: "auto",
        whiteSpace: "normal",
      }}
    >
      {value}
    </Badge>
  )

  return (
    <>
      <Group gap={6}>
        {values.length === 0 ? (
          <Text size="xs" c="dimmed">未設定</Text>
        ) : (
          visible.map(renderBadge)
        )}
      </Group>
      {values.length > 6 && (
        <>
          <Collapse in={expanded} transitionDuration={200}>
            <Group gap={6} mt="xs">
              {values.slice(6).map(renderBadge)}
            </Group>
          </Collapse>
          <Group justify="center" mt="xs">
            <Button
              size="compact-xs"
              variant="subtle"
              color="gray"
              fw={400}
              onClick={onToggle}
              aria-expanded={expanded}
              rightSection={
                <IconChevronDown
                  size={14}
                  style={{
                    transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 200ms ease",
                  }}
                />
              }
            >
              {expanded ? "折りたたむ" : `ほか${values.length - 6}件を表示`}
            </Button>
          </Group>
        </>
      )}
    </>
  )
}
