"use client"

import { Button, Stack, TagsInput, Text } from "@mantine/core"
import { Modal } from "@/components/Modal"
import { ActionPanel } from "@/components/ActionPanel"
import type { useMediaDetailEditing } from "@/features/media-detail/useMediaDetailEditing"

type Props = {
  pending?: boolean
  options?: string[]
} & Pick<
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
  pending = false,
  options,
}: Props) {
  return (
    <Modal
      opened={detailEditor === "tags"}
      onClose={() => { if (!pending) setDetailEditor(null) }}
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
          data={options ?? ["旅行", "風景", "家族", "お気に入り"]}
          value={detailDraft}
          onChange={setDetailDraft}
          disabled={pending}
        />

        </Stack>
      </Modal.Body>
      <Modal.Divider />
      <Modal.Footer>
        <ActionPanel>
          <ActionPanel.End>
          <Button variant="default" disabled={pending} onClick={() => setDetailEditor(null)}>
            キャンセル
          </Button>
          <Button loading={pending} disabled={pending} onClick={saveDetailDraft}>変更を反映</Button>
          </ActionPanel.End>
        </ActionPanel>
      </Modal.Footer>

    </Modal>
  )
}
