"use client"

import { Button, MultiSelect, Stack, Text } from "@mantine/core"
import { Modal } from "@/components/Modal"
import { ActionPanel } from "@/components/ActionPanel"
import type { useMediaDetailEditing } from "@/features/media-detail/useMediaDetailEditing"

type Props = {
  groupOptions?: string[]
  pending?: boolean
  loadError?: boolean
  onRetryLoad?: () => void
} & Pick<
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
  pending = false,
  loadError = false,
  onRetryLoad,
  detailEditor,
  setDetailEditor,
  detailDraft,
  setDetailDraft,
  saveDetailDraft,
}: Props) {
  return (
    <Modal
      opened={detailEditor === "groups"}
      onClose={() => {
        if (!pending) setDetailEditor(null)
      }}
      title="Groupsを編集"
      centered
      zIndex={400}
    >
      <Modal.Body>
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            現在の所属Groupを追加・除外できます。
          </Text>
          {loadError && (
            <Text size="sm" c="red" role="alert">
              Group一覧を取得できませんでした。
            </Text>
          )}
          {loadError && (
            <Button variant="default" onClick={onRetryLoad}>
              再試行
            </Button>
          )}
          <MultiSelect
            label="Groups"
            searchable
            data={groupOptions ?? ["旅行", "家族", "風景写真", "お気に入り"]}
            value={detailDraft}
            onChange={setDetailDraft}
            disabled={pending || loadError}
          />
        </Stack>
      </Modal.Body>
      <Modal.Divider />
      <Modal.Footer>
        <ActionPanel>
          <ActionPanel.End>
            <Button
              variant="default"
              disabled={pending}
              onClick={() => setDetailEditor(null)}
            >
              キャンセル
            </Button>
            <Button
              loading={pending}
              disabled={pending || loadError}
              onClick={saveDetailDraft}
            >
              変更を反映
            </Button>
          </ActionPanel.End>
        </ActionPanel>
      </Modal.Footer>
    </Modal>
  )
}
