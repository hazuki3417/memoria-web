"use client"

import { Button, Text } from "@mantine/core"
import { Dialog } from "@/components/Dialog"
import type { MediaItem } from "../types"

export type MediaDeleteDialogProps = {
  target: MediaItem | null
  onCancel: () => void
  onConfirm: (target: MediaItem) => void
}

/** Single-Media deletion confirmation. Persistence is owned by the caller. */
export function MediaDeleteDialog({
  target,
  onCancel,
  onConfirm,
}: MediaDeleteDialogProps) {
  return (
    <Dialog
      opened={target !== null}
      onClose={onCancel}
      title="Mediaを削除"
      size="md"
      zIndex={410}
      footer={
        <Dialog.Footer
          secondary={
            <Button variant="default" onClick={onCancel}>
              キャンセル
            </Button>
          }
          primary={
            <Button
              color="red"
              disabled={!target}
              onClick={() => {
                if (target) onConfirm(target)
              }}
            >
              削除
            </Button>
          }
        />
      }
    >
      <Text size="sm">
        このMediaを削除します。削除したMediaは復元できません。
      </Text>
    </Dialog>
  )
}
