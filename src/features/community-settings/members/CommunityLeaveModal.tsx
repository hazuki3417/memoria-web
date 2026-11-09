"use client"

import { Button, Group, Modal, Stack, Text } from "@mantine/core"
import { FeedbackPanel } from "@/components/Feedback"
import type { CommunityMembersActions } from "./useCommunityMembersState"
import type { useCommunityMembersState } from "./useCommunityMembersState"
type MembersState = ReturnType<typeof useCommunityMembersState>

/** Leave confirmation and its completion/error UI. */
export function CommunityLeaveModal({
  state, onLeave,
}: { state: MembersState } & Pick<CommunityMembersActions, "onLeave">) {
  const { opened, busy, error, blocked, close, leave } = state
  return (
      <Modal
        opened={opened}
        onClose={close}
        title="Communityから退会"
        centered
        size="xl"
        closeOnClickOutside={!busy}
        closeOnEscape={!busy}
        withCloseButton={!busy}
      >
        <Stack gap="lg">
          <Stack gap="sm">
            <Text fw={600}>このCommunityから退会しますか？</Text>
            <Text size="sm">
              退会すると、このCommunityにアクセスできなくなります。自分が管理するMediaのこのCommunityへの共有と分類は解除されます。
            </Text>
            <Text size="sm">
              自分のアカウント、Personal
              Media、Communityが管理するMediaは削除されません。
            </Text>
            <Text size="sm" c="dimmed">
              退会後に元の参加状態へ自動的には戻りません。
            </Text>
          </Stack>
          {error && (
            <FeedbackPanel kind="error" title="退会できませんでした" role="alert">
              {error}
            </FeedbackPanel>
          )}
          <Group justify="flex-end">
            <Button variant="default" disabled={busy} onClick={close}>
              キャンセル
            </Button>
            <Button
              color="red"
              loading={busy}
              disabled={!onLeave || blocked}
              onClick={() => void leave()}
            >
              退会する
            </Button>
          </Group>
        </Stack>
      </Modal>
  )
}
