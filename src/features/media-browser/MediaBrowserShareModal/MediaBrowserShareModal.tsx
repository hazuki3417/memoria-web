"use client"

import { Button, Select, Stack, Text } from "@mantine/core"
import { Modal } from "@/components/Modal"
import { ActionPanel } from "@/components/ActionPanel"

type MediaBrowserShareModalProps = {
  opened: boolean
  selectedCount: number
  communityTarget: string | null
  onTargetChange: (value: string | null) => void
  onClose: () => void
}

export function MediaBrowserShareModal({
  opened,
  selectedCount,
  communityTarget,
  onTargetChange,
  onClose,
}: MediaBrowserShareModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Communityへ共有" size="md">
      <Modal.Body>
        <Stack gap="xs">
              <Stack gap={4}>
                <Text size="sm">
                  {selectedCount}
                  件の選択Mediaから、共有可能なUser管理Mediaを1つのCommunityへ共有します。
                </Text>
                <Text size="xs" c="dimmed">
                  Community管理Mediaや、選択した共有先へすでに共有済みのMediaには新しい共有関係を作成しません。
                </Text>
              </Stack>
              <Select
                label="Community"
                placeholder="Communityを選択"
                data={["Photo Club", "Family Archive", "Travel Team"]}
                value={communityTarget}
                onChange={onTargetChange}
              />
        </Stack>
      </Modal.Body>
      <Modal.Divider />
      <Modal.Footer>
        <ActionPanel><ActionPanel.End>
          <Button variant="default" onClick={onClose}>キャンセル</Button>
                <Button disabled={!communityTarget} onClick={onClose}>共有</Button>
        </ActionPanel.End></ActionPanel>
      </Modal.Footer>
    </Modal>
  )
}
