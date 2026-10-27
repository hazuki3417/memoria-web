"use client"

import type { Ref } from "react"
import { Box, Button, Group, Text } from "@mantine/core"
import { IconEdit, IconX } from "@tabler/icons-react"

type GroupDetailToolbarProps = {
 compact: boolean
 selected: { name: string } | null
 headingRef?: Ref<HTMLParagraphElement>
 hideManagementActions: boolean
 canManage: boolean
 detailsReady: boolean
 onEdit: () => void
 onClose: () => void
}

export function GroupDetailToolbar({
  compact,
  selected,
  headingRef: compactDetailHeadingRef,
  hideManagementActions,
  canManage,
  detailsReady,
  onEdit: openEdit,
  onClose: closeDetail,
}: GroupDetailToolbarProps) {
 return compact ? (
      <Box
        pb="xs"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto",
          alignItems: "center",
          gap: "var(--mantine-spacing-xs)",
        }}
      >
        <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
          <Text
            fw={700}
            truncate="end"
            ref={compactDetailHeadingRef}
            tabIndex={-1}
          >
            {selected?.name ?? ""}
          </Text>
        </Group>
        <Button
          size="xs"
          variant="default"
          leftSection={<IconX size={16} />}
          onClick={closeDetail}
        >
          一覧に戻る
        </Button>
      </Box>
 ) : (
      <Box
        pb="xs"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto",
          alignItems: "center",
          gap: "var(--mantine-spacing-xs)",
        }}
      >
        <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
          <Text fw={700} truncate="end">
            {selected?.name ?? ""}
          </Text>
        </Group>
        <Group gap="xs" wrap="nowrap" justify="flex-end">
          {!hideManagementActions && (
            <Button
              size="xs"
              variant="default"
              leftSection={<IconEdit size={16} />}
              onClick={openEdit}
              disabled={!canManage || !detailsReady}
            >
              編集
            </Button>
          )}
          <Button
            size="xs"
            variant="default"
            leftSection={<IconX size={16} />}
            onClick={closeDetail}
          >
            閉じる
          </Button>
        </Group>
      </Box>
 )
}
