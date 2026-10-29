"use client"

import { Button, Text } from "@mantine/core"
import { Dialog } from "@/components/Dialog"

type MediaBrowserDeleteDialogProps = {
  opened: boolean
  selectedCount: number
  onClose: () => void
  onDelete: () => void
}

export function MediaBrowserDeleteDialog({
  opened,
  selectedCount,
  onClose,
  onDelete,
}: MediaBrowserDeleteDialogProps) {
  return (
    <Dialog
            opened={opened}
            onClose={() => onClose()}
            title="Mediaを削除"
            size="md"
            footer={
              <Dialog.Footer
                secondary={
                  <Button
                    variant="default"
                    onClick={() => onClose()}
                  >
                    キャンセル
                  </Button>
                }
                primary={
                  <Button
                    color="red"
                    onClick={() => onDelete()}
                  >
                    削除
                  </Button>
                }
              />
            }
          >
            <Text size="sm">
              選択した{selectedCount}
              件のMediaを削除します。削除したMediaは復元できません。
            </Text>
          </Dialog>
  )
}
