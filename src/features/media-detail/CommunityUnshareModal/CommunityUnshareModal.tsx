"use client"

import { Button, Stack, Text } from "@mantine/core"
import { Modal } from "@/components/Modal"
import { ActionPanel } from "@/components/ActionPanel"
import type { useMediaDetailEditing } from "@/features/media-detail/useMediaDetailEditing"

type Props = Pick<
  ReturnType<typeof useMediaDetailEditing>,
  "unshareTarget" | "setUnshareTarget" | "removeCommunityShare"
>

/** One modal per component to isolate interaction and test scope. */
export function CommunityUnshareModal({
  unshareTarget,
  setUnshareTarget,
  removeCommunityShare,
}: Props) {
  return (
    <Modal
      opened={unshareTarget !== null}
      onClose={() => setUnshareTarget(null)}
      title="Communityの共有を解除"
      centered
      zIndex={410}
    >
      <Modal.Body>
        <Stack gap="md">
        <Text size="sm">
          {unshareTarget} への共有を解除しますか？
          このCommunityからMediaを閲覧できなくなります。他の共有先やMedia本体は削除されません。
        </Text>

        </Stack>
      </Modal.Body>
      <Modal.Footer>
        <ActionPanel>
          <ActionPanel.End>
          <Button variant="default" onClick={() => setUnshareTarget(null)}>
            キャンセル
          </Button>
          <Button color="red" onClick={removeCommunityShare}>
            共有解除
          </Button>
          </ActionPanel.End>
        </ActionPanel>
      </Modal.Footer>

    </Modal>
  )
}
