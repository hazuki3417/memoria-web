"use client"

import {
  Badge, Box, Button, Group, Menu, Modal, Radio, ScrollArea, Stack,
  Table, Text, TextInput,
} from "@mantine/core"
import { IconDots, IconSearch } from "@tabler/icons-react"
import { PageHeader } from "@/components/PageHeader"
import { SectionHeader } from "@/components/SectionHeader"
import { FeedbackPanel } from "@/components/Feedback"
import { UsageSortHeader } from "@/features/usage/UsageSortHeader"
import type { CommunityMember } from "@/features/community/CommunityProvider"
import {
  useCommunityMembersState,
  COMMUNITY_MEMBER_LIMIT,
  COMMUNITY_ADMIN_LIMIT,
  type CommunityMembersActions,
} from "./useCommunityMembersState"

export type { CommunityMember } from "@/features/community/CommunityProvider"
export { COMMUNITY_MEMBER_LIMIT, COMMUNITY_ADMIN_LIMIT } from "./useCommunityMembersState"

const previewMembers: CommunityMember[] = [
  { id: "self", name: "ユーザー", role: "admin", isSelf: true },
  { id: "m1", name: "山田 花子", role: "admin" },
  { id: "m2", name: "佐藤 葵", role: "member" },
  { id: "m3", name: "鈴木 太郎", role: "member" },
]

// The API defines the default order: self first, then nickname ascending.
export function CommunityMembersContent({
  members = previewMembers,
  onLeave,
  onLeaveSuccess,
  onChangeRole,
  onRemoveMember,
}: { members?: CommunityMember[] } & CommunityMembersActions) {
  const {
    query, setQuery, sort, opened, setOpened, busy, error, done,
    roleTarget, setRoleTarget, selectedRole, setSelectedRole, roleBusy, roleError,
    setRoleError, removeTarget, setRemoveTarget, removeBusy, removeError,
    setRemoveError, self, adminCount, memberLimitReached, adminLimitReached,
    blocked, rows, changeSort, ariaSort, close, leave, confirmRoleChange, confirmRemoval,
  } = useCommunityMembersState({
    members, onLeave, onLeaveSuccess, onChangeRole, onRemoveMember,
  })
  const visibleRowCount = 4
  const tableRowHeight = 48
  const tableHeaderHeight = 44
  return (
    <Stack gap="xl">
      <PageHeader
        title="メンバー"
        description="Communityの参加者と役割を確認します。"
      />
      <Box>
        <SectionHeader>参加者</SectionHeader>
        <Group gap="xs" mb="sm">
          <Badge variant="light">
            参加者 {members.length} / {COMMUNITY_MEMBER_LIMIT}
          </Badge>
          <Badge variant="light">
            Administrator {adminCount} / {COMMUNITY_ADMIN_LIMIT}
          </Badge>
        </Group>
        {memberLimitReached && (
          <Text size="sm" c="orange" mb="sm">
            参加者の上限に達しています。新しい参加者を追加できません。
          </Text>
        )}
        {adminLimitReached && (
          <Text size="sm" c="dimmed" mb="sm">
            Administratorの上限に達しています。これ以上Administratorへ変更できません。
          </Text>
        )}
        <TextInput
          aria-label="参加者を名前で検索"
          placeholder="名前で検索"
          leftSection={<IconSearch size={16} />}
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          mb="md"
        />
        <Box>
          <Box style={{ overflowX: "auto" }}>
            <Box miw={400}>
              <ScrollArea
                type="hover"
                scrollbarSize={8}
                h={tableHeaderHeight + visibleRowCount * tableRowHeight}
              >
                <Table
                  striped
                  highlightOnHover
                  stickyHeader
                  style={{
                    tableLayout: "fixed",
                    borderBottom:
                      "1px solid var(--mantine-color-default-border)",
                  }}
                  styles={{
                    th: { height: tableHeaderHeight, boxSizing: "border-box" },
                    td: { height: tableRowHeight, boxSizing: "border-box" },
                  }}
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th w="45%" aria-sort={ariaSort("name")}>
                        <UsageSortHeader
                          label="名前"
                          direction={
                            sort?.key === "name" ? sort.direction : null
                          }
                          align="left"
                          disabled={false}
                          onSort={() => changeSort("name")}
                        />
                      </Table.Th>
                      <Table.Th aria-sort={ariaSort("role")}>
                        <UsageSortHeader
                          label="役割"
                          direction={
                            sort?.key === "role" ? sort.direction : null
                          }
                          align="left"
                          disabled={false}
                          onSort={() => changeSort("role")}
                        />
                      </Table.Th>
                      {self?.role === "admin" && (
                        <Table.Th w={52}>
                          <Text size="xs">操作</Text>
                        </Table.Th>
                      )}
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {rows.map((member) => (
                      <Table.Tr key={member.id}>
                        <Table.Td w="45%">
                          {member.name}{" "}
                          {member.isSelf && (
                            <Badge size="xs" variant="light">
                              自分
                            </Badge>
                          )}
                        </Table.Td>
                        <Table.Td>
                          {member.role === "admin" ? "Administrator" : "Member"}
                        </Table.Td>
                        {self?.role === "admin" && (
                          <Table.Td w={52}>
                            {!member.isSelf && (
                              <Menu position="bottom-end" withinPortal>
                                <Menu.Target>
                                  <Button
                                    size="compact-xs"
                                    variant="subtle"
                                    aria-label={`${member.name}の管理操作`}
                                  >
                                    <IconDots size={18} />
                                  </Button>
                                </Menu.Target>
                                <Menu.Dropdown>
                                  <Menu.Item
                                    disabled={!onChangeRole}
                                    onClick={() => {
                                      setRoleError(false)
                                      setRoleTarget(member)
                                      setSelectedRole(member.role)
                                    }}
                                  >
                                    役割を変更
                                  </Menu.Item>
                                  <Menu.Item
                                    disabled={
                                      !onRemoveMember ||
                                      (member.role === "admin" &&
                                        adminCount <= 1)
                                    }
                                    onClick={() => { setRemoveError(false); setRemoveTarget(member) }}
                                    color="red"
                                  >
                                    除外
                                  </Menu.Item>
                                </Menu.Dropdown>
                              </Menu>
                            )}
                          </Table.Td>
                        )}
                      </Table.Tr>
                    ))}
                    {rows.length === 0 && (
                      <Table.Tr>
                        <Table.Td colSpan={self?.role === "admin" ? 3 : 2}>
                          <Text c="dimmed" ta="center" py="md">
                            該当する参加者はいません。
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box>
        <Box c="red">
          <SectionHeader>Communityから退会</SectionHeader>
        </Box>
        <Stack gap="sm">
          <Text size="sm">
            退会すると、このCommunityへのアクセスと、自分が管理するMediaのこのCommunityへの共有・分類が解除されます。アカウントやCommunity管理Mediaは削除されません。
          </Text>
          {done && (
            <Text size="sm" c="green">
              退会処理が完了しました。
            </Text>
          )}
          <Group>
            <Button
              color="red"
              variant="light"
              disabled={!onLeave || blocked || done}
              onClick={() => setOpened(true)}
            >
              Communityから退会する
            </Button>
          </Group>
          {blocked && (
            <Text size="sm" c="red">
              最後のAdministratorは退会できません。別の参加者をAdministratorに変更してから退会してください。
            </Text>
          )}
        </Stack>
      </Box>
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
    </Stack>
  )
}
