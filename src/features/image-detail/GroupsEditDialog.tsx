"use client"

import { Button, Group, Modal, MultiSelect, Stack, Text } from "@mantine/core"
import type { useImageDetailEditing } from "@/features/image-detail/useImageDetailEditing"

type Props = Pick<ReturnType<typeof useImageDetailEditing>, "detailEditor" | "setDetailEditor" | "detailDraft" | "setDetailDraft" | "saveDetailDraft">

/** One modal per component to isolate interaction and test scope. */
export function GroupsEditDialog({
  detailEditor,
  setDetailEditor,
  detailDraft,
  setDetailDraft,
  saveDetailDraft,
}: Props) {
  return (
      <Modal
        withCloseButton={false}
        opened={detailEditor === "groups"}
        onClose={() => setDetailEditor(null)}
        title="Groupsを編集"
        centered
        zIndex={400}
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            現在の所属Groupを追加・除外できます。
          </Text>
          <MultiSelect
            label="Groups"
            searchable
            data={["旅行", "家族", "風景写真", "お気に入り"]}
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
