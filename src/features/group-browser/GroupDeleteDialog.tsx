"use client"

import { Button, Group, Modal, Stack, Text } from "@mantine/core"

export function GroupDeleteDialog({
  opened,
  name,
  saving,
  canManage,
  onClose,
  onConfirm,
}: {
  opened: boolean
  name: string
  saving: boolean
  canManage: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
}) {
  return (
    <Modal
      opened={opened}
      onClose={() => {
        if (!saving) onClose()
      }}
      closeOnEscape={!saving}
      closeOnClickOutside={!saving}
      title="Groupを削除"
      centered
      withCloseButton={false}
    >
      <Stack>
        <Text size="sm">
          「{name}
          」を削除します。このGroupによるMedia分類とGroup間の関係は削除されますが、Media本体と他のGroupは削除されません。
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose} disabled={saving}>
            キャンセル
          </Button>
          <Button
            color="red"
            disabled={!canManage || saving}
            onClick={() => void onConfirm()}
          >
            削除
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
