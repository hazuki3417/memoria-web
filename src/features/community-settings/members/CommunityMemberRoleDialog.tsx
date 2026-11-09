"use client"

import { Badge, Button, Group, Modal, Radio, Stack, Text } from "@mantine/core"
import { FeedbackPanel } from "@/components/Feedback"
import type { CommunityMembersActions } from "./useCommunityMembersState"
import type { useCommunityMembersState } from "./useCommunityMembersState"
type MembersState = ReturnType<typeof useCommunityMembersState>

/** Role change confirmation and last-admin capacity guidance. */
export function CommunityMemberRoleDialog({
  state, onChangeRole,
}: { state: MembersState } & Pick<CommunityMembersActions, "onChangeRole">) {
  const {
    roleTarget, setRoleTarget, roleBusy, roleError, setRoleError,
    selectedRole, setSelectedRole, adminLimitReached, adminCount, confirmRoleChange,
  } = state
  return (
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
  )
}
