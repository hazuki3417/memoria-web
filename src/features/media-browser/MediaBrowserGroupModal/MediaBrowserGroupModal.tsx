"use client"

import { Alert, Button, Group, MultiSelect, Stack, Text } from "@mantine/core"
import type { MediaItem } from "@/features/media-detail"
import type { GroupActionResult } from "../MediaBrowser"
import { Modal } from "@/components/Modal"
import { ActionPanel } from "@/components/ActionPanel"

type MediaBrowserGroupModalProps = {
  opened: boolean
  selected: Set<string>
  groupActionPending: boolean
  groupActionResult?: GroupActionResult | null
  groupActionError?: string | null
  onRetryGroupOptions?: () => void
  onDismissGroupActionResult?: () => void
  groupTargets: string[]
  onTargetsChange: (targets: string[]) => void
  groupOptions?: { value: string; label: string }[]
  items: MediaItem[]
  onClose: () => void
  onAddToGroups: () => Promise<void>
}

export function MediaBrowserGroupModal({
  opened,
  selected,
  groupActionPending,
  groupActionResult,
  groupActionError,
  onRetryGroupOptions,
  onDismissGroupActionResult,
  groupTargets,
  onTargetsChange,
  groupOptions,
  items,
  onClose,
  onAddToGroups,
}: MediaBrowserGroupModalProps) {
  return (
    <Modal opened={opened} onClose={() => { if (!groupActionPending) { onClose(); onDismissGroupActionResult?.() } }} title="Groupに追加" size="md">
      <Modal.Body>
        <Stack gap="xs">
              <Text size="sm">
                {selected.size}件のMediaを選択したすべてのGroupに追加します。
              </Text>
              {groupActionError && (
                <Alert color="red" role="alert">
                  <Group justify="space-between">
                    <Text size="sm">{groupActionError}</Text>
                    {onRetryGroupOptions && (
                      <Button
                        size="xs"
                        variant="default"
                        onClick={onRetryGroupOptions}
                      >
                        再試行
                      </Button>
                    )}
                  </Group>
                </Alert>
              )}
              {groupActionResult && (
                <Stack gap="xs">
                  <Text size="sm">
                    追加成功: {groupActionResult.succeeded}件 / 既に追加済み:{" "}
                    {groupActionResult.alreadyApplied}件 / 失敗:{" "}
                    {groupActionResult.failed.length}件
                  </Text>
                  {groupActionResult.failed.map((item) => (
                    <Text key={item.mediaId} size="sm" c="red">
                      {items.find((media) => media.id === item.mediaId)
                        ?.label ?? item.mediaId}
                      ：
                      {item.errorCode === "NOT_FOUND"
                        ? "Mediaが利用できません"
                        : "追加できませんでした"}
                    </Text>
                  ))}
                </Stack>
              )}
              <MultiSelect
                label="Group"
                placeholder="Groupを選択"
                searchable
                data={groupOptions ?? ["旅行", "家族", "風景写真", "お気に入り"]}
                value={groupTargets}
                onChange={(value) => {
                  onTargetsChange(value)
                  onDismissGroupActionResult?.()
                }}
              />
        </Stack>
      </Modal.Body>
      <Modal.Divider />
      <Modal.Footer>
        <ActionPanel><ActionPanel.End>
          <Button variant="default" disabled={groupActionPending} onClick={() => { onClose(); onDismissGroupActionResult?.() }}>
                  {groupActionResult ? "結果を閉じる" : "キャンセル"}
                </Button>
                <Button disabled={groupTargets.length === 0 || groupActionPending || selected.size === 0}
                  loading={groupActionPending} onClick={() => void onAddToGroups()}>
                  {groupActionResult ? "失敗したMediaを再試行" : "追加"}
                </Button>
        </ActionPanel.End></ActionPanel>
      </Modal.Footer>
    </Modal>
  )
}
