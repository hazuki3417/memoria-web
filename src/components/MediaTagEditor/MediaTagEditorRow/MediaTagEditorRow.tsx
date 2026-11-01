"use client"

import { Box, Checkbox, Group, Stack, TagsInput, Text } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { IconPhoto } from "@tabler/icons-react"
import type { ReactNode } from "react"

export function MediaTagEditorRow({
  label,
  detail,
  tags,
  selected,
  selectable = true,
  tagEditable = true,
  supplementary,
  action,
  onSelect,
  onTagsChange,
}: {
  label: string
  detail?: string
  tags: string[]
  selected: boolean
  selectable?: boolean
  tagEditable?: boolean
  supplementary?: ReactNode
  action?: ReactNode
  onSelect: (checked: boolean) => void
  onTagsChange: (tags: string[]) => void
}) {
  const compact = useMediaQuery("(max-width: 48em)")
  const info = (
    <>
      <Text size="sm" fw={600} truncate>
        {label}
      </Text>
      {detail && (
        <Text size="xs" c="dimmed">
          {detail}
        </Text>
      )}
    </>
  )
  if (compact)
    return (
      <Box p="sm">
        <Group align="center" wrap="nowrap" h={72}>
          <Checkbox
            checked={selected}
            disabled={!selectable}
            onChange={(e) => onSelect(e.currentTarget.checked)}
            aria-label={`${label}を選択`}
          />
          <Box
            w={72}
            h={72}
            style={{
              flex: "0 0 auto",
              borderRadius: "var(--mantine-radius-sm)",
              background: "var(--mantine-color-default-hover)",
              display: "grid",
              placeItems: "center",
              overflow: "hidden",
            }}
          >
            <IconPhoto size={22} stroke={1.4} />
          </Box>
          <Stack
            gap={4}
            justify="center"
            h={72}
            style={{ flex: "0 0 28%", minWidth: 0, overflow: "hidden" }}
          >
            <Box style={{ minWidth: 0 }}>{info}</Box>
            {supplementary}
          </Stack>
          <Box h={72} style={{ flex: 1, minWidth: 0 }}>
            <TagsInput
              value={tags}
              onChange={onTagsChange}
              disabled={!tagEditable}
              size="xs"
              placeholder="Tagを追加"
              styles={{
                root: { height: "100%" },
                wrapper: { height: "100%" },
                input: {
                  minHeight: "72px",
                  height: "72px",
                  alignContent: "flex-start",
                  paddingTop: "8px",
                  paddingBottom: "8px",
                },
              }}
            />
          </Box>
          <Box w={28} style={{ flex: "0 0 28px" }}>
            {action ?? null}
          </Box>
        </Group>
      </Box>
    )
  return (
    <Box p="sm">
      <Group align="center" wrap="nowrap" gap="md" h={72}>
        <Checkbox
          checked={selected}
          disabled={!selectable}
          onChange={(e) => onSelect(e.currentTarget.checked)}
          aria-label={`${label}を選択`}
        />
        <Group
          align="center"
          wrap="nowrap"
          gap="sm"
          h={72}
          style={{ flex: "0 0 36%", minWidth: 0, overflow: "hidden" }}
        >
          <Box
            w={72}
            h={72}
            style={{
              flex: "0 0 auto",
              borderRadius: "var(--mantine-radius-sm)",
              background: "var(--mantine-color-default-hover)",
              display: "grid",
              placeItems: "center",
              overflow: "hidden",
            }}
          >
            <IconPhoto size={28} stroke={1.4} />
          </Box>
          <Stack
            gap={4}
            justify="center"
            h={72}
            style={{ flex: 1, minWidth: 0, overflow: "hidden" }}
          >
            <Box style={{ minWidth: 0 }}>{info}</Box>
            {supplementary}
          </Stack>
        </Group>
        <Box h={72} style={{ flex: "1 1 54%", minWidth: 420 }}>
          <TagsInput
            value={tags}
            onChange={onTagsChange}
            disabled={!tagEditable}
            size="sm"
            placeholder="Tagを追加"
            styles={{
              root: { height: "100%" },
              wrapper: { height: "100%" },
              input: {
                minHeight: "72px",
                height: "72px",
                alignContent: "flex-start",
                paddingTop: "8px",
                paddingBottom: "8px",
              },
            }}
          />
        </Box>
        <Box w={36} style={{ flex: "0 0 36px" }}>
          {action ?? null}
        </Box>
      </Group>
    </Box>
  )
}
