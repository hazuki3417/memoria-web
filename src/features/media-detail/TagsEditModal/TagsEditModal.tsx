"use client"

import { Button, Stack, TagsInput, Text } from "@mantine/core"
import { Modal } from "@/components/Modal"
import { ActionPanel } from "@/components/ActionPanel"
import type { useMediaDetailEditing } from "@/features/media-detail/useMediaDetailEditing"

type Props = Pick<
  ReturnType<typeof useMediaDetailEditing>,
  | "detailEditor"
  | "setDetailEditor"
  | "detailDraft"
  | "setDetailDraft"
  | "saveDetailDraft"
>

/** One modal per component to isolate interaction and test scope. */
export function TagsEditModal({
  detailEditor,
  setDetailEditor,
  detailDraft,
  setDetailDraft,
  saveDetailDraft,
}: Props) {
  return (
    <Modal
      opened={detailEditor === "tags"}
      onClose={() => setDetailEditor(null)}
      title="Tagsを編集"
      centered
      zIndex={400}
    >
      <Modal.Body>
        <Stack gap="md">
        <Text size="sm" c="dimmed">
          このMediaのTagを追加・除外できます。
        </Text>
        <TagsInput
          label="Tags"
          data={["旅行", "風景", "家族", "お気に入り"]}
          value={detailDraft}
          onChange={setDetailDraft}
        />

        </Stack>
      </Modal.Body>
      <Modal.Divider />
      <Modal.Footer>
        <ActionPanel>
          <ActionPanel.End>
          <Button variant="default" onClick={() => setDetailEditor(null)}>
            キャンセル
          </Button>
          <Button onClick={saveDetailDraft}>変更を反映</Button>
          </ActionPanel.End>
        </ActionPanel>
      </Modal.Footer>

    </Modal>
  )
}
