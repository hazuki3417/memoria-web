"use client"

import {
  Badge, Box, Button, Group, Menu, ScrollArea, Stack,
  Table, Text, TextInput,
} from "@mantine/core"
import { IconDots, IconSearch } from "@tabler/icons-react"
import { PageHeader } from "@/components/PageHeader"
import { SectionHeader } from "@/components/SectionHeader"
import { UsageSortHeader } from "@/features/usage/UsageSortHeader"
import { CommunityMemberManagementDialogs } from "./CommunityMemberManagementDialogs"
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
  const state = useCommunityMembersState({
    members, onLeave, onLeaveSuccess, onChangeRole, onRemoveMember,
  })
  const {
    query, setQuery, sort, done, setOpened,
    setRoleTarget, setSelectedRole, setRoleError, setRemoveTarget, setRemoveError,
    self, adminCount, memberLimitReached, adminLimitReached, blocked,
    rows, changeSort, ariaSort,
  } = state
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
      <CommunityMemberManagementDialogs
        state={state}
        onLeave={onLeave}
        onChangeRole={onChangeRole}
        onRemoveMember={onRemoveMember}
      />
    </Stack>
  )
}
