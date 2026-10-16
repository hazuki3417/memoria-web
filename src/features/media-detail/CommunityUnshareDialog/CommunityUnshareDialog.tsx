"use client"

import { Button, Group, Modal, Stack, Text } from "@mantine/core"
import type { useMediaDetailEditing } from "@/features/media-detail/useMediaDetailEditing"

type Props = Pick<
  ReturnType<typeof useMediaDetailEditing>,
  "unshareTarget" | "setUnshareTarget" | "removeCommunityShare"
>

/** One modal per component to isolate interaction and test scope. */
export function CommunityUnshareDialog({
  unshareTarget,
  setUnshareTarget,
  removeCommunityShare,
}: Props) {
  return (
    <Modal
      withCloseButton={false}
      opened={unshareTarget !== null}
      onClose={() => setUnshareTarget(null)}
      title="Communityの共有を解除"
      centered
      zIndex={410}
    >
      <Stack gap="md">
        <Text size="sm">
          {unshareTarget} への共有を解除しますか？
          このCommunityからMediaを閲覧できなくなります。他の共有先やMedia本体は削除されません。
        </Text>

        <Group justify="flex-end">
          <Button variant="default" onClick={() => setUnshareTarget(null)}>
            キャンセル
          </Button>
          <Button color="red" onClick={removeCommunityShare}>
            共有解除
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
