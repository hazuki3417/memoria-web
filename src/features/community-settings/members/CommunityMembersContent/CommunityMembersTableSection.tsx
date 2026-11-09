"use client"

import { Badge, Box, Button, Group, Menu, ScrollArea, Stack, Table, Text, TextInput } from "@mantine/core"
import { IconDots, IconSearch } from "@tabler/icons-react"
import { SectionHeader } from "@/components/SectionHeader"
import { UsageSortHeader } from "@/features/usage/UsageSortHeader"
import type { CommunityMember } from "@/features/community/CommunityProvider"
import { COMMUNITY_MEMBER_LIMIT, COMMUNITY_ADMIN_LIMIT } from "./useCommunityMembersState"
import type { useCommunityMembersState, CommunityMembersActions } from "./useCommunityMembersState"

type MembersState = ReturnType<typeof useCommunityMembersState>

/** Member count, search, sorting and administrative row operations. */
export function CommunityMembersTableSection({
  members,
  state,
  onChangeRole,
  onRemoveMember,
}: { members: CommunityMember[]; state: MembersState } & Pick<CommunityMembersActions, "onChangeRole" | "onRemoveMember">) {
  const {
    query, setQuery, sort, setRoleError, setRoleTarget, setSelectedRole,
    setRemoveError, setRemoveTarget, self, adminCount, memberLimitReached,
    adminLimitReached, rows, changeSort, ariaSort,
  } = state
  const visibleRowCount = 4
  const tableRowHeight = 48
  const tableHeaderHeight = 44
  return (
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
  )
}
