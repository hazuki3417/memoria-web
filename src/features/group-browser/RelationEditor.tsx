"use client"

import { Group, MultiSelect, Stack, Text } from "@mantine/core"
import {
  groupRelationOptionReason,
  groupRelationOptions,
  sortGroupRelationNames,
  type GroupRelationCandidateAvailability,
} from "./groupRelationOptions"

export function RelationEditor({
  label,
  names,
  oppositeNames,
  onChange,
  currentGroupName,
  candidates = [],
  availability,
}: {
  label: string
  names: string[]
  oppositeNames: string[]
  onChange: (names: string[]) => void
  currentGroupName: string
  candidates?: string[]
  availability?: GroupRelationCandidateAvailability
}) {
  const direction = label === "Parents" ? "parent" : "child"
  const data = groupRelationOptions({
    candidates,
    names,
    oppositeNames,
    currentGroupName,
    direction,
    availability,
  })

  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <Text fw={600} size="sm">
          {label}
        </Text>
        <Text size="xs" c="dimmed">
          {names.length} / 10
        </Text>
      </Group>
      <MultiSelect
        data={data}
        value={names}
        onChange={(values) => onChange(sortGroupRelationNames(values))}
        searchable
        placeholder="Groupを検索"
        rightSection={null}
        maxValues={10}
        hidePickedOptions={false}
        nothingFoundMessage="候補がありません"
        styles={{
          input: {
            height: 120,
            overflow: "hidden",
            alignItems: "flex-start",
          },
          pillsList: {
            height: "100%",
            overflowY: "auto",
            alignContent: "flex-start",
          },
        }}
        renderOption={({ option, checked }) => {
          const reason = groupRelationOptionReason({
            name: option.value,
            checked,
            oppositeNames,
            currentGroupName,
            direction,
            availability,
          })
          return (
            <Group justify="space-between" wrap="nowrap" w="100%">
              <Text size="sm">{option.label}</Text>
              <Text size="xs" c="dimmed">
                {reason}
              </Text>
            </Group>
          )
        }}
      />
      {names.length >= 10 && (
        <Text size="xs" c="dimmed">
          追加できるGroupは10件までです
        </Text>
      )}
    </Stack>
  )
}
