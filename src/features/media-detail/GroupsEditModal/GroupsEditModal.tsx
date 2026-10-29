"use client"

import { Button, MultiSelect, Stack, Text } from "@mantine/core"
import { Modal } from "@/components/Modal"
import { ActionPanel } from "@/components/ActionPanel"
import type { useMediaDetailEditing } from "@/features/media-detail/useMediaDetailEditing"

type Props = { groupOptions?: string[] } & Pick<
  ReturnType<typeof useMediaDetailEditing>,
  | "detailEditor"
  | "setDetailEditor"
  | "detailDraft"
  | "setDetailDraft"
  | "saveDetailDraft"
>

/** One modal per component to isolate interaction and test scope. */
export function GroupsEditModal({
  groupOptions,
  detailEditor,
  setDetailEditor,
  detailDraft,
  setDetailDraft,
  saveDetailDraft,
}: Props) {
  return (
    <Modal
      opened={detailEditor === "groups"}
      onClose={() => setDetailEditor(null)}
      title="Groupsを編集"
      centered
      zIndex={400}
    >
      <Modal.Body>
        <Stack gap="md">
        <Text size="sm" c="dimmed">
          現在の所属Groupを追加・除外できます。
        </Text>
        <MultiSelect
          label="Groups"
          searchable
          data={groupOptions ?? ["旅行", "家族", "風景写真", "お気に入り"]}
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
