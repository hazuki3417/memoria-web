"use client"

import { Button, Text } from "@mantine/core"
import { Modal } from "@/components/Modal"
import { ActionPanel } from "@/components/ActionPanel"
import type { MediaItem } from "../types"

export type MediaDeleteModalProps = {
  target: MediaItem | null
  onCancel: () => void
  onConfirm: (target: MediaItem) => void
}

/** Single-Media deletion confirmation. Persistence is owned by the caller. */
export function MediaDeleteModal({
  target,
  onCancel,
  onConfirm,
}: MediaDeleteModalProps) {
  return (
    <Modal
      opened={target !== null}
      onClose={onCancel}
      title="Mediaを削除"
      size="md"
      zIndex={410}
    >
      <Modal.Body>
        <Text size="sm">
          このMediaを削除します。削除したMediaは復元できません。
        </Text>
      </Modal.Body>
      <Modal.Footer>
        <ActionPanel>
          <ActionPanel.End>
            <Button variant="default" onClick={onCancel}>
              キャンセル
            </Button>
            <Button
              color="red"
              disabled={!target}
              onClick={() => {
                if (target) onConfirm(target)
              }}
            >
              削除
            </Button>
          </ActionPanel.End>
        </ActionPanel>
      </Modal.Footer>
    </Modal>
  )
}
