"use client"

import { Button, Select, Stack, Text } from "@mantine/core"
import { Modal } from "@/components/Modal"
import { ActionPanel } from "@/components/ActionPanel"
import type { useMediaDetailEditing } from "@/features/media-detail/useMediaDetailEditing"

type Props = Pick<
  ReturnType<typeof useMediaDetailEditing>,
  | "detailEditor"
  | "setDetailEditor"
  | "detailValues"
  | "shareTarget"
  | "setShareTarget"
  | "addCommunityShare"
>

/** One modal per component to isolate interaction and test scope. */
export function CommunityShareModal({
  detailEditor,
  setDetailEditor,
  detailValues,
  shareTarget,
  setShareTarget,
  addCommunityShare,
}: Props) {
  return (
    <Modal
      opened={detailEditor === "communities"}
      onClose={() => setDetailEditor(null)}
      title="Communityへ共有"
      centered
      zIndex={400}
    >
      <Modal.Body>
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            このMediaを共有するCommunityを1つ選択します。
          </Text>
          <Select
            label="共有先Community"
            searchable
            data={["Photo Club", "Family", "Travel"].filter(
              (name) => !detailValues.communities.includes(name),
            )}
            value={shareTarget}
            onChange={setShareTarget}
            placeholder="Communityを選択"
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
            <Button disabled={!shareTarget} onClick={addCommunityShare}>
              共有する
            </Button>
          </ActionPanel.End>
        </ActionPanel>
      </Modal.Footer>
    </Modal>
  )
}
