"use client"

import { Button, Group, Modal, Select, Stack, Text } from "@mantine/core"
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
export function CommunityShareDialog({
  detailEditor,
  setDetailEditor,
  detailValues,
  shareTarget,
  setShareTarget,
  addCommunityShare,
}: Props) {
  return (
    <Modal
      withCloseButton={false}
      opened={detailEditor === "communities"}
      onClose={() => setDetailEditor(null)}
      title="Communityへ共有"
      centered
      zIndex={400}
    >
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

        <Group justify="flex-end">
          <Button variant="default" onClick={() => setDetailEditor(null)}>
            キャンセル
          </Button>
          <Button disabled={!shareTarget} onClick={addCommunityShare}>
            共有する
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
