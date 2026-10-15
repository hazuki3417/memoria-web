"use client"

import { Button, Group, Modal, Stack, TagsInput, Text } from "@mantine/core"
import type { useImageDetailEditing } from "@/features/image-detail/useImageDetailEditing"

type Props = Pick<ReturnType<typeof useImageDetailEditing>, "detailEditor" | "setDetailEditor" | "detailDraft" | "setDetailDraft" | "saveDetailDraft">

/** One modal per component to isolate interaction and test scope. */
export function TagsEditDialog({
  detailEditor,
  setDetailEditor,
  detailDraft,
  setDetailDraft,
  saveDetailDraft,
}: Props) {
  return (
      <Modal
        withCloseButton={false}
        opened={detailEditor === "tags"}
        onClose={() => setDetailEditor(null)}
        title="Tagsを編集"
        centered
        zIndex={400}
      >
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

          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDetailEditor(null)}>
              キャンセル
            </Button>
            <Button onClick={saveDetailDraft}>変更を反映</Button>
          </Group>
        </Stack>
      </Modal>
  )
}
