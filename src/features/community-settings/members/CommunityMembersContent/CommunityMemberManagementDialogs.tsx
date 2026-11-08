"use client"

import { Badge, Button, Group, Modal, Radio, Stack, Text } from "@mantine/core"
import { FeedbackPanel } from "@/components/Feedback"
import type { CommunityMembersActions } from "./useCommunityMembersState"
import type { useCommunityMembersState } from "./useCommunityMembersState"

type MembersState = ReturnType<typeof useCommunityMembersState>

/** Owns presentation for member removal, role change and leaving dialogs. */
export function CommunityMemberManagementDialogs({
  state,
  onLeave,
  onChangeRole,
  onRemoveMember,
}: { state: MembersState } & CommunityMembersActions) {
  const {
    removeTarget, setRemoveTarget, removeBusy, removeError, setRemoveError,
    roleTarget, setRoleTarget, roleBusy, roleError, setRoleError,
    selectedRole, setSelectedRole, adminLimitReached, adminCount,
    confirmRemoval, confirmRoleChange,
    opened, busy, error, blocked, close, leave,
  } = state
  return (
    <>
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
      <Modal
        opened={roleTarget !== null}
        onClose={() => {
          if (!roleBusy) { setRoleTarget(null); setRoleError(false) }
        }}
        title="役割を変更"
        centered
      >
        <Stack gap="md">
          <Text size="sm">
            {roleTarget?.name}のCommunity内の役割を変更します。
          </Text>
          <Stack gap={4}>
            <Text size="sm" fw={500}>
              現在の役割
            </Text>
            <Badge variant="light">
              {roleTarget?.role === "admin" ? "Administrator" : "Member"}
            </Badge>
          </Stack>
          <Radio.Group
            label="変更後の役割"
            value={selectedRole}
            onChange={(value) => setSelectedRole(value as "admin" | "member")}
          >
            <Stack gap="sm" mt="sm">
              <Radio
                value="admin"
                label="Administrator"
                description="Communityの設定やメンバーを管理できます。"
                disabled={roleTarget?.role !== "admin" && adminLimitReached}
              />
              <Radio
                value="member"
                label="Member"
                description="Communityに参加し、許可されたMediaを利用できます。"
                disabled={roleTarget?.role === "admin" && adminCount <= 1}
              />
            </Stack>
          </Radio.Group>
          {roleTarget?.role === "admin" && adminCount <= 1 && (
            <Text size="sm" c="red">
              最後のAdministratorはMemberに変更できません。
            </Text>
          )}
          {roleTarget?.role !== "admin" && adminLimitReached && (
            <Text size="sm" c="dimmed">
              Administratorの上限に達しているため変更できません。
            </Text>
          )}
          {roleError && (
            <FeedbackPanel kind="warning" title="役割変更の結果を確認できませんでした" role="alert">
              メンバーの現在の役割を確認してから、必要な場合だけ操作し直してください。
            </FeedbackPanel>
          )}
          <Group justify="flex-end">
            <Button
              variant="default"
              disabled={roleBusy}
              onClick={() => { setRoleTarget(null); setRoleError(false) }}
            >
              キャンセル
            </Button>
            <Button
              loading={roleBusy}
              disabled={
                !onChangeRole ||
                roleError ||
                selectedRole === roleTarget?.role ||
                (selectedRole === "admin" && adminLimitReached) ||
                (selectedRole === "member" &&
                  roleTarget?.role === "admin" &&
                  adminCount <= 1)
              }
              onClick={() => void confirmRoleChange()}
            >
              変更する
            </Button>
          </Group>
        </Stack>
      </Modal>
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
    </>
  )
}
