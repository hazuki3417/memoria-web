"use client"

import { useMemo, useState } from "react"
import { Badge, Box, Button, Group, Menu, Modal, ScrollArea, Stack, Stepper, Table, Text, TextInput, UnstyledButton } from "@mantine/core"
import { IconDots, IconSearch } from "@tabler/icons-react"
import { PageHeader } from "@/components/PageHeader"
import { SectionHeader } from "@/components/SectionHeader"

export type CommunityMember = { id: string; name: string; role: "admin" | "member"; isSelf?: boolean }
export const COMMUNITY_MEMBER_LIMIT = 30
export const COMMUNITY_ADMIN_LIMIT = 3
const previewMembers: CommunityMember[] = [
  { id: "self", name: "ユーザー", role: "admin", isSelf: true },
  { id: "m1", name: "山田 花子", role: "admin" },
  { id: "m2", name: "佐藤 葵", role: "member" },
  { id: "m3", name: "鈴木 太郎", role: "member" },
]
type SortKey = "name" | "role"
export function CommunityMembersContent({ members = previewMembers, onLeave }: {
  members?: CommunityMember[]
  onLeave?: () => Promise<void>
}) {
  const [query, setQuery] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("name")
  const [descending, setDescending] = useState(false)
  const [opened, setOpened] = useState(false)
  const [step, setStep] = useState(0)
  const [confirmation, setConfirmation] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)
  const self = members.find((member) => member.isSelf)
  const adminCount = members.filter((member) => member.role === "admin").length
  const memberLimitReached = members.length >= COMMUNITY_MEMBER_LIMIT
  const adminLimitReached = adminCount >= COMMUNITY_ADMIN_LIMIT
  const blocked = self?.role === "admin" && adminCount <= 1
  const rows = useMemo(() => members.filter((member) => member.name.toLocaleLowerCase("ja-JP").includes(query.trim().toLocaleLowerCase("ja-JP"))).sort((a, b) => {
    const aValue = sortKey === "role" ? a.role : a.name
    const bValue = sortKey === "role" ? b.role : b.name
    const result = aValue.localeCompare(bValue, "ja-JP")
    return descending ? -result : result
  }), [members, query, sortKey, descending])
  const visibleRowCount = 8
  const tableRowHeight = 48
  const tableHeaderHeight = 44
  const changeSort = (key: SortKey) => {
    if (key === sortKey) setDescending((value) => !value)
    else { setSortKey(key); setDescending(false) }
  }
  const close = () => { if (!busy) { setOpened(false); setStep(0); setConfirmation(""); setError("") } }
  const leave = async () => {
    if (!onLeave || confirmation !== "退会する" || blocked || busy) return
    setBusy(true); setError("")
    try { await onLeave(); setDone(true); setOpened(false) }
    catch { setError("退会処理に失敗しました。現在の参加状況を確認して再試行してください。") }
    finally { setBusy(false) }
  }
  return (
    <Stack gap="xl">
      <PageHeader title="メンバー" description="Communityの参加者と役割を確認します。" />
      <Box>
        <SectionHeader>参加者</SectionHeader>
        <Group gap="xs" mb="sm"><Badge variant="light">参加者 {members.length} / {COMMUNITY_MEMBER_LIMIT}</Badge><Badge variant="light">Administrator {adminCount} / {COMMUNITY_ADMIN_LIMIT}</Badge></Group>
        {memberLimitReached && <Text size="sm" c="orange" mb="sm">参加者の上限に達しています。新しい参加者を追加できません。</Text>}
        {adminLimitReached && <Text size="sm" c="dimmed" mb="sm">Administratorの上限に達しています。これ以上Administratorへ変更できません。</Text>}
        <TextInput aria-label="参加者を名前で検索" placeholder="名前で検索" leftSection={<IconSearch size={16} />} value={query} onChange={(event) => setQuery(event.currentTarget.value)} mb="md" />
        <Box style={{ borderRadius: "var(--mantine-radius-md)", overflow: "hidden", border: "1px solid var(--mantine-color-default-border)" }}>
          <ScrollArea type="hover" w="100%" h={tableHeaderHeight + visibleRowCount * tableRowHeight}>
          <Table striped highlightOnHover miw={400} stickyHeader styles={{ th: { height: tableHeaderHeight }, td: { height: tableRowHeight } }}>
            <Table.Thead><Table.Tr>
              <Table.Th><UnstyledButton onClick={() => changeSort("name")} aria-label="名前で並び替え">名前 {sortKey === "name" ? descending ? "↓" : "↑" : "↕"}</UnstyledButton></Table.Th>
              <Table.Th><UnstyledButton onClick={() => changeSort("role")} aria-label="役割で並び替え">役割 {sortKey === "role" ? descending ? "↓" : "↑" : "↕"}</UnstyledButton></Table.Th>
              {self?.role === "admin" && <Table.Th w={52}><Text size="xs">操作</Text></Table.Th>}
            </Table.Tr></Table.Thead>
            <Table.Tbody>
              {rows.map((member) => <Table.Tr key={member.id}>
                <Table.Td>{member.name} {member.isSelf && <Badge size="xs" variant="light">自分</Badge>}</Table.Td>
                <Table.Td>{member.role === "admin" ? "Administrator" : "Member"}</Table.Td>
                {self?.role === "admin" && <Table.Td>{!member.isSelf && <Menu position="bottom-end" withinPortal><Menu.Target><Button size="compact-xs" variant="subtle" aria-label={member.name + "の管理操作"}><IconDots size={18} /></Button></Menu.Target><Menu.Dropdown><Menu.Item disabled>役割を変更</Menu.Item><Menu.Item disabled color="red">除外</Menu.Item></Menu.Dropdown></Menu>}</Table.Td>}
              </Table.Tr>)}
              {rows.length === 0 && <Table.Tr><Table.Td colSpan={self?.role === "admin" ? 3 : 2}><Text c="dimmed" ta="center" py="md">該当する参加者はいません。</Text></Table.Td></Table.Tr>}
            </Table.Tbody>
          </Table>
          </ScrollArea>
        </Box>
      </Box>
      <Box>
        <Box c="red"><SectionHeader>Communityから退会</SectionHeader></Box>
        <Stack gap="sm" maw={620}>
          <Text size="sm">退会すると、このCommunityへのアクセスと、自分が管理するMediaのこのCommunityへの共有・分類が解除されます。アカウントやCommunity管理Mediaは削除されません。</Text>
          {blocked && <Text size="sm" c="red">最後のAdministratorは退会できません。別の参加者をAdministratorに変更してから退会してください。</Text>}
          {done && <Text size="sm" c="green">退会処理が完了しました。</Text>}
          <Group><Button color="red" variant="light" disabled={blocked || done} onClick={() => setOpened(true)}>Communityから退会する</Button></Group>
        </Stack>
      </Box>
      <Modal opened={opened} onClose={close} title="Communityから退会" centered size="lg" closeOnClickOutside={!busy}>
        <Stack gap="lg">
          <Stepper active={step} size="sm" allowNextStepsSelect={false}>
            <Stepper.Step label="影響を確認" description="アクセスと共有" />
            <Stepper.Step label="最終確認" description="退会を確定" />
          </Stepper>
          {step === 0 ? <Stack gap="sm">
            <Text fw={600}>退会すると変更されること</Text>
            <Text size="sm">このCommunityにアクセスできなくなります。自分が管理するMediaのこのCommunityへの共有と分類は解除されます。</Text>
            <Text size="sm">自分のアカウント、Personal Media、Communityが管理するMediaは削除されません。</Text>
          </Stack> : <Stack gap="sm">
            <Text size="sm">操作を確定するには「退会する」と入力してください。退会後に元の参加状態へ自動的には戻りません。</Text>
            <TextInput label="確認用テキスト" placeholder="退会する" value={confirmation} onChange={(event) => setConfirmation(event.currentTarget.value)} />
          </Stack>}
          {error && <Text size="sm" c="red" role="alert">{error}</Text>}
          <Group justify="space-between">
            <Button variant="default" disabled={busy} onClick={step === 0 ? close : () => setStep(0)}>{step === 0 ? "キャンセル" : "戻る"}</Button>
            {step === 0 ? <Button onClick={() => setStep(1)}>次へ</Button> : <Button color="red" loading={busy} disabled={!onLeave || confirmation !== "退会する" || blocked} onClick={() => void leave()}>退会を確定する</Button>}
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}
