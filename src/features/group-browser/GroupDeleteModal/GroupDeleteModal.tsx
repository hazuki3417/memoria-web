"use client"

import { Button, Text } from "@mantine/core"
import { Modal } from "@/components/Modal"
import { ActionPanel } from "@/components/ActionPanel"

export function GroupDeleteModal({
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
    >
      <Modal.Body>
        <Text size="sm">
          「{name}
          」を削除します。このGroupによるMedia分類とGroup間の関係は削除されますが、Media本体と他のGroupは削除されません。
        </Text>
      </Modal.Body>
      <Modal.Footer>
        <ActionPanel>
          <ActionPanel.End>
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
          </ActionPanel.End>
        </ActionPanel>
      </Modal.Footer>
    </Modal>
  )
}
