"use client"

import { Button, Group, Modal, Stack, Text } from "@mantine/core"
import { FeedbackPanel } from "@/components/Feedback"
import type { useCommunityMembersState } from "./useCommunityMembersState"
type MembersState = ReturnType<typeof useCommunityMembersState>

/** Removal confirmation and result-unknown warning. */
export function CommunityMemberRemovalDialog({ state }: { state: MembersState }) {
  const {
    removeTarget, setRemoveTarget, removeBusy, removeError, setRemoveError,
    confirmRemoval,
  } = state
  return (
      <Modal
        opened={removeTarget !== null}
        onClose={() => {
          if (!removeBusy) { setRemoveTarget(null); setRemoveError(false) }
        }}
        title="メンバーを除外"
        centered
      >
        <Stack gap="md">
          <Text fw={600}>
            {removeTarget?.name}をこのCommunityから除外しますか？
          </Text>
          <Text size="sm">
            除外すると、このメンバーはCommunityへアクセスできなくなります。対象者が管理するMediaの、このCommunityへの共有と分類は解除されます。
          </Text>
          <Text size="sm">
            対象者のアカウントやPersonal
            Media、Communityが管理するMediaは削除されません。
          </Text>
          <Text size="sm" c="dimmed">
            除外後に元の参加状態へ自動的には戻りません。
          </Text>
          {removeError && (
            <FeedbackPanel kind="warning" title="除外の結果を確認できませんでした" role="alert">
              メンバーの現在の参加状態を確認してから、必要な場合だけ操作し直してください。
            </FeedbackPanel>
          )}
          <Group justify="flex-end">
            <Button
              variant="default"
              disabled={removeBusy}
              onClick={() => { setRemoveTarget(null); setRemoveError(false) }}
            >
              キャンセル
            </Button>
            <Button
              color="red"
              loading={removeBusy}
              disabled={removeError}
              onClick={() => void confirmRemoval()}
            >
              除外する
            </Button>
          </Group>
        </Stack>
      </Modal>
  )
}
