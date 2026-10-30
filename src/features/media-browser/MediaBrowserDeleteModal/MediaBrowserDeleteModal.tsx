"use client"

import { Button, Text } from "@mantine/core"
import { ActionPanel } from "@/components/ActionPanel"
import { Modal } from "@/components/Modal"

type MediaBrowserDeleteModalProps = {
  opened: boolean
  selectedCount: number
  onClose: () => void
  onDelete: () => void
}

export function MediaBrowserDeleteModal({
  opened,
  selectedCount,
  onClose,
  onDelete,
}: MediaBrowserDeleteModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Mediaを削除" size="md">
      <Modal.Body>
        <Text size="sm">
          選択した{selectedCount}
          件のMediaを削除します。削除したMediaは復元できません。
        </Text>
      </Modal.Body>
      <Modal.Footer>
        <ActionPanel>
          <ActionPanel.End>
            <Button variant="default" onClick={onClose}>
              キャンセル
            </Button>
            <Button color="red" onClick={onDelete}>
              削除
            </Button>
          </ActionPanel.End>
        </ActionPanel>
      </Modal.Footer>
    </Modal>
  )
}
