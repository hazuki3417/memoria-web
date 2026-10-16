"use client"

import { useMemo, useState } from "react"
import {
  Badge,
  Box,
  Button,
  Group,
  Menu,
  Modal,
  Radio,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core"
import { IconDots, IconSearch } from "@tabler/icons-react"
import { PageHeader } from "@/components/PageHeader"
import { SectionHeader } from "@/components/SectionHeader"
import { showNotification } from "@/components/Feedback"

export type CommunityMember = {
  id: string
  name: string
  role: "admin" | "member"
  isSelf?: boolean
}
export const COMMUNITY_MEMBER_LIMIT = 30
export const COMMUNITY_ADMIN_LIMIT = 3
const previewMembers: CommunityMember[] = [
  { id: "self", name: "ユーザー", role: "admin", isSelf: true },
  { id: "m1", name: "山田 花子", role: "admin" },
  { id: "m2", name: "佐藤 葵", role: "member" },
  { id: "m3", name: "鈴木 太郎", role: "member" },
]
type SortKey = "name" | "role"
export function CommunityMembersContent({
  members = previewMembers,
  onLeave,
  onLeaveSuccess,
  onChangeRole,
  onRemoveMember,
}: {
  members?: CommunityMember[]
  onLeave?: () => Promise<void>
  onLeaveSuccess?: () => void
  onChangeRole?: (userId: string, role: "admin" | "member") => Promise<boolean>
  onRemoveMember?: (userId: string) => Promise<boolean>
}) {
  const [query, setQuery] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("name")
  const [descending, setDescending] = useState(false)
  const [opened, setOpened] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)
  const [roleTarget, setRoleTarget] = useState<CommunityMember | null>(null)
  const [selectedRole, setSelectedRole] = useState<"admin" | "member">("member")
  const [roleBusy, setRoleBusy] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<CommunityMember | null>(null)
  const [removeBusy, setRemoveBusy] = useState(false)
  const self = members.find((member) => member.isSelf)
  const adminCount = members.filter((member) => member.role === "admin").length
  const memberLimitReached = members.length >= COMMUNITY_MEMBER_LIMIT
  const adminLimitReached = adminCount >= COMMUNITY_ADMIN_LIMIT
  const blocked = self?.role === "admin" && adminCount <= 1
  const rows = useMemo(
    () =>
      members
        .filter((member) =>
          member.name
            .toLocaleLowerCase("ja-JP")
            .includes(query.trim().toLocaleLowerCase("ja-JP")),
        )
        .sort((a, b) => {
          const aValue = sortKey === "role" ? a.role : a.name
          const bValue = sortKey === "role" ? b.role : b.name
          const result = aValue.localeCompare(bValue, "ja-JP")
          return descending ? -result : result
        }),
    [members, query, sortKey, descending],
  )
  const visibleRowCount = 4
  const tableRowHeight = 48
  const tableHeaderHeight = 44
  const changeSort = (key: SortKey) => {
    if (key === sortKey) setDescending((value) => !value)
    else {
      setSortKey(key)
      setDescending(false)
    }
  }
  const close = () => {
    if (!busy) {
      setOpened(false)
      setError("")
    }
  }
  const leave = async () => {
    if (!onLeave || blocked || busy) return
    setBusy(true)
    setError("")
    try {
      await onLeave()
      setDone(true)
      setOpened(false)
      showNotification({
        kind: "success",
        title: "Communityから退会しました",
        message: "退会処理が完了しました。",
      })
      onLeaveSuccess?.()
    } catch {
      setError(
        "退会処理に失敗しました。現在の参加状況を確認して再試行してください。",
      )
    } finally {
      setBusy(false)
    }
  }
  const confirmRoleChange = async () => {
    if (!roleTarget || !onChangeRole || roleBusy || selectedRole === roleTarget.role ||
      (selectedRole === "admin" && adminLimitReached) ||
      (selectedRole === "member" && roleTarget.role === "admin" && adminCount <= 1)) return
    setRoleBusy(true)
    try {
      if (await onChangeRole(roleTarget.id, selectedRole)) setRoleTarget(null)
    } finally {
      setRoleBusy(false)
    }
  }
  const confirmRemoval = async () => {
    if (!removeTarget || !onRemoveMember || removeBusy) return
    setRemoveBusy(true)
    try {
      if (await onRemoveMember(removeTarget.id)) setRemoveTarget(null)
    } finally {
      setRemoveBusy(false)
    }
  }
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
        <Box
          style={{
            borderRadius: "var(--mantine-radius-md)",
            overflow: "hidden",
            border: "1px solid var(--mantine-color-default-border)",
          }}
        >
          <Box style={{ overflowX: "auto" }}>
            <Box miw={400}>
              <Table striped withRowBorders style={{ tableLayout: "fixed" }}>
                <Table.Thead>
                  <Table.Tr style={{ height: tableHeaderHeight }}>
                    <Table.Th w="45%">
                      <UnstyledButton
                        onClick={() => changeSort("name")}
                        aria-label="名前で並び替え"
                      >
                        名前{" "}
                        {sortKey === "name" ? (descending ? "↓" : "↑") : "↕"}
                      </UnstyledButton>
                    </Table.Th>
                    <Table.Th>
                      <UnstyledButton
                        onClick={() => changeSort("role")}
                        aria-label="役割で並び替え"
                      >
                        役割{" "}
                        {sortKey === "role" ? (descending ? "↓" : "↑") : "↕"}
                      </UnstyledButton>
                    </Table.Th>
                    {self?.role === "admin" && (
                      <Table.Th w={52}>
                        <Text size="xs">操作</Text>
                      </Table.Th>
                    )}
                  </Table.Tr>
                </Table.Thead>
              </Table>
              <ScrollArea
                type="hover"
                scrollbarSize={8}
                h={visibleRowCount * tableRowHeight}
              >
                <Table
                  striped
                  highlightOnHover
                  withRowBorders
                  style={{ tableLayout: "fixed" }}
                  styles={{
                    td: {
                      height: tableRowHeight,
                      borderBottom:
                        "1px solid var(--mantine-color-default-border)",
                    },
                  }}
                >
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
                                    aria-label={member.name + "の管理操作"}
                                  >
                                    <IconDots size={18} />
                                  </Button>
                                </Menu.Target>
                                <Menu.Dropdown>
                                  <Menu.Item
                                    disabled={!onChangeRole}
                                    onClick={() => { setRoleTarget(member); setSelectedRole(member.role) }}
                                  >
                                    役割を変更
                                  </Menu.Item>
                                  <Menu.Item
                                    disabled={!onRemoveMember || (member.role === "admin" && adminCount <= 1)}
                                    onClick={() => setRemoveTarget(member)}
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
        <Stack gap="sm" maw={620}>
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
        onClose={() => { if (!removeBusy) setRemoveTarget(null) }}
        title="メンバーを除外"
        centered
      >
        <Stack gap="md">
          <Text fw={600}>{removeTarget?.name}をこのCommunityから除外しますか？</Text>
          <Text size="sm">除外すると、このメンバーはCommunityへアクセスできなくなります。対象者が管理するMediaの、このCommunityへの共有と分類は解除されます。</Text>
          <Text size="sm">対象者のアカウントやPersonal Media、Communityが管理するMediaは削除されません。</Text>
          <Text size="sm" c="dimmed">除外後に元の参加状態へ自動的には戻りません。</Text>
          <Group justify="flex-end">
            <Button variant="default" disabled={removeBusy} onClick={() => setRemoveTarget(null)}>キャンセル</Button>
            <Button color="red" loading={removeBusy} onClick={() => void confirmRemoval()}>除外する</Button>
          </Group>
        </Stack>
      </Modal>
      <Modal
        opened={roleTarget !== null}
        onClose={() => { if (!roleBusy) setRoleTarget(null) }}
        title="役割を変更"
        centered
      >
        <Stack gap="md">
          <Text size="sm">{roleTarget?.name}のCommunity内の役割を変更します。</Text>
          <Stack gap={4}>
            <Text size="sm" fw={500}>現在の役割</Text>
            <Badge variant="light">{roleTarget?.role === "admin" ? "Administrator" : "Member"}</Badge>
          </Stack>
          <Radio.Group label="変更後の役割" value={selectedRole} onChange={(value) => setSelectedRole(value as "admin" | "member")}>
            <Stack gap="sm" mt="sm">
              <Radio value="member" label="Member" description="Communityに参加し、許可されたMediaを利用できます。" disabled={roleTarget?.role === "admin" && adminCount <= 1} />
              <Radio value="admin" label="Administrator" description="Communityの設定やメンバーを管理できます。" disabled={roleTarget?.role !== "admin" && adminLimitReached} />
            </Stack>
          </Radio.Group>
          {roleTarget?.role === "admin" && adminCount <= 1 && (
            <Text size="sm" c="red">最後のAdministratorはMemberに変更できません。</Text>
          )}
          {roleTarget?.role !== "admin" && adminLimitReached && (
            <Text size="sm" c="dimmed">Administratorの上限に達しているため変更できません。</Text>
          )}
          <Group justify="flex-end">
            <Button variant="default" disabled={roleBusy} onClick={() => setRoleTarget(null)}>キャンセル</Button>
            <Button loading={roleBusy} disabled={!onChangeRole || selectedRole === roleTarget?.role ||
              (selectedRole === "admin" && adminLimitReached) ||
              (selectedRole === "member" && roleTarget?.role === "admin" && adminCount <= 1)}
              onClick={() => void confirmRoleChange()}>変更する</Button>
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
            <Text size="sm" c="red" role="alert">
              {error}
            </Text>
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
