"use client"

import {
  Box,
  Button,
  Checkbox,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
} from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import type { ReactNode } from "react"

export type MediaTagBulkAction = "add" | "remove" | "replace"
export type MediaTagBulkSummaryItem = { label: string; value: string }

export function MediaTagBulkEditor({
  selectedCount,
  allSelected,
  indeterminate,
  selectionDisabled = false,
  summaryItems = [],
  value,
  placeholder = "選択したMediaのTag",
  actions = ["add", "remove", "replace"],
  actionDisabled = false,
  headerAction,
  selectAllLabel = "Mediaをすべて選択",
  onToggleAll,
  onChange,
  onAction,
}: {
  selectedCount: number
  allSelected: boolean
  indeterminate: boolean
  selectionDisabled?: boolean
  summaryItems?: MediaTagBulkSummaryItem[]
  value: string
  placeholder?: string
  actions?: MediaTagBulkAction[]
  actionDisabled?: boolean
  headerAction?: ReactNode
  selectAllLabel?: string
  onToggleAll: () => void
  onChange: (value: string) => void
  onAction: (action: MediaTagBulkAction) => void
}) {
  const compact = useMediaQuery("(max-width: 48em)")
  return (
    <Stack gap="sm">
      <Paper withBorder radius="md" p="sm">
        {compact ? (
          <Stack gap="sm">
            <Group justify="space-between" wrap="nowrap">
              <Group gap="sm" wrap="nowrap">
                <Checkbox
                  checked={allSelected}
                  indeterminate={indeterminate}
                  onChange={onToggleAll}
                  disabled={selectionDisabled}
                  aria-label={selectAllLabel}
                />
                <Text size="sm" fw={600}>
                  {selectedCount}件選択
                </Text>
              </Group>
              {headerAction}
            </Group>
            {summaryItems.length > 0 && (
              <Group gap="lg">
                <Stack gap={0}>
                  {summaryItems.map((item) => (
                    <Text key={item.label} size="xs" c="dimmed">
                      {item.label}
                    </Text>
                  ))}
                </Stack>
                <Stack gap={0}>
                  {summaryItems.map((item) => (
                    <Text key={item.label} size="xs" c="dimmed">
                      {item.value}
                    </Text>
                  ))}
                </Stack>
              </Group>
            )}
            <TextInput
              value={value}
              onChange={(e) => onChange(e.currentTarget.value)}
              disabled={selectionDisabled}
              placeholder={placeholder}
            />
          </Stack>
        ) : (
          <Group align="center" wrap="nowrap" gap="md">
            <Checkbox
              checked={allSelected}
              indeterminate={indeterminate}
              onChange={onToggleAll}
              disabled={selectionDisabled}
              aria-label={selectAllLabel}
            />
            <Box w={72} style={{ flex: "0 0 72px" }}>
              <Text size="sm" fw={600}>
                {selectedCount}件選択
              </Text>
            </Box>
            {summaryItems.length > 0 && (
              <>
                <Divider orientation="vertical" />
                <Stack gap={0} style={{ flex: "0 0 22%", minWidth: 180 }}>
                  {summaryItems.map((item) => (
                    <Group key={item.label} gap="xs" wrap="nowrap">
                      <Text size="xs" c="dimmed" w={88}>
                        {item.label}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {item.value}
                      </Text>
                    </Group>
                  ))}
                </Stack>
              </>
            )}
            <Divider orientation="vertical" />
            <TextInput
              style={{ flex: 1 }}
              value={value}
              onChange={(e) => onChange(e.currentTarget.value)}
              disabled={selectionDisabled}
              placeholder={placeholder}
            />
            {headerAction && (
              <Box w={36} style={{ flex: "0 0 36px" }}>
                {headerAction}
              </Box>
            )}
          </Group>
        )}
      </Paper>
      <Group justify="center" gap="xs">
        {actions.includes("add") && (
          <Button
            variant="default"
            size="sm"
            disabled={actionDisabled}
            onClick={() => onAction("add")}
          >
            追加
          </Button>
        )}
        {actions.includes("remove") && (
          <Button
            variant="default"
            size="sm"
            disabled={actionDisabled}
            onClick={() => onAction("remove")}
          >
            除去
          </Button>
        )}
        {actions.includes("replace") && (
          <Button
            variant="default"
            size="sm"
            disabled={actionDisabled}
            onClick={() => onAction("replace")}
          >
            置換
          </Button>
        )}
      </Group>
    </Stack>
  )
}
