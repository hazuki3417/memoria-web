"use client"

import { useState } from "react"
import {
  Alert, Badge, Box, Button, Group, Modal, Paper, Stack, Text, TextInput, Title,
} from "@mantine/core"

type Role = "admin" | "member"
type InvitationState = "none" | "active" | "expired" | "revoked"

export function CommunitySettings({
  role = "admin",
  communityId = "photo-club",
}: {
  role?: Role
  communityId?: string
}) {
  const isAdmin = role === "admin"
  const [name, setName] = useState("家族のアルバム")
  const [draft, setDraft] = useState(name)
  const [editing, setEditing] = useState(false)
  const [invitation, setInvitation] = useState<InvitationState>("none")
  const [expiresAt, setExpiresAt] = useState("")
  const [confirm, setConfirm] = useState<"reissue" | "revoke" | null>(null)
  const [feedback, setFeedback] = useState("")
  const [busy, setBusy] = useState(false)
  const invitationUrl = `https://example.com/invitations/${communityId}-demo`

  const issue = () => {
    setBusy(true)
    setInvitation("active")
    setExpiresAt(new Date(Date.now() + 7 * 86400000).toLocaleString("ja-JP"))
    setFeedback("招待URLを発行しました（Prototype上の操作です）")
    setBusy(false)
  }
  const changeInvitation = () => {
    if (confirm === "revoke") {
      setInvitation("revoked")
      setFeedback("招待URLを無効化しました（Prototype上の操作です）")
    } else {
      issue()
      setFeedback("招待URLを再発行しました。旧URLは利用できません（Prototype上の操作です）")
    }
    setConfirm(null)
  }
  return (
    <Box maw={760} mx="auto" px={{ base: "md", sm: "xl" }} py="xl">
      <Stack gap="xl">
        <Box>
          <Title order={2}>Community Settings</Title>
          <Text c="dimmed" size="sm">Communityの基本情報と管理</Text>
        </Box>
        {feedback && <Alert withCloseButton onClose={() => setFeedback("")}>{feedback}</Alert>}
        <Paper withBorder p="lg" radius="md">
          <Stack>
            <Title order={3}>General</Title>
            <Text size="sm" c="dimmed">Community名</Text>
            {editing && isAdmin ? (
              <>
                <TextInput aria-label="Community名" value={draft} onChange={(event) => setDraft(event.currentTarget.value)} error={!draft.trim() ? "Community名を入力してください" : undefined} />
                <Group justify="flex-end">
                  <Button variant="default" onClick={() => { setDraft(name); setEditing(false) }}>キャンセル</Button>
                  <Button disabled={!draft.trim()} onClick={() => { setName(draft.trim()); setEditing(false); setFeedback("Community名を変更しました（Prototype上の操作です）") }}>保存</Button>
                </Group>
              </>
            ) : (
              <Group justify="space-between" align="center">
                <Text fw={600}>{name}</Text>
                {isAdmin && <Button variant="default" onClick={() => setEditing(true)}>変更</Button>}
              </Group>
            )}
          </Stack>
        </Paper>
        <Paper withBorder p="lg" radius="md">
          <Stack>
            <Title order={3}>Invitation</Title>
            {!isAdmin ? (
              <Text c="dimmed" size="sm">招待はAdministratorが管理します。</Text>
            ) : (
              <>
                <Group><Badge variant="light">{invitation === "active" ? "有効" : invitation === "expired" ? "期限切れ" : invitation === "revoked" ? "無効化済み" : "未発行"}</Badge></Group>
                {invitation === "active" ? (
                  <>
                    <TextInput label="招待URL" value={invitationUrl} readOnly />
                    <Text size="sm" c="dimmed">有効期限: {expiresAt}</Text>
                    <Group>
                      <Button variant="default" onClick={() => { void navigator.clipboard.writeText(invitationUrl).then(() => setFeedback("招待URLをコピーしました")).catch(() => setFeedback("コピーに失敗しました")) }}>URLをコピー</Button>
                      <Button variant="default" onClick={() => setConfirm("reissue")}>再発行</Button>
                      <Button color="red" variant="outline" onClick={() => setConfirm("revoke")}>無効化</Button>
                    </Group>
                  </>
                ) : (
                  <>
                    <Text c="dimmed" size="sm">現在利用できる招待URLはありません。</Text>
                    <Group><Button loading={busy} onClick={issue}>招待URLを発行</Button></Group>
                  </>
                )}
              </>
            )}
          </Stack>
        </Paper>
        {isAdmin && (
          <Paper withBorder p="lg" radius="md">
            <Stack>
              <Title order={3} c="red">Danger Zone</Title>
              <Text size="sm">Communityの削除は元に戻せません。Community管理Mediaも削除対象になります。</Text>
              <Group><Button color="red" variant="outline" component="a" href={`/communities/${encodeURIComponent(communityId)}/settings/delete`}>削除の確認へ</Button></Group>
            </Stack>
          </Paper>
        )}
      </Stack>
      <Modal opened={confirm !== null} onClose={() => setConfirm(null)} title={confirm === "reissue" ? "招待URLを再発行" : "招待URLを無効化"} centered>
        <Stack>
          <Text size="sm">現在の招待URLは利用できなくなります。共有済みのURLからも参加できなくなります。</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setConfirm(null)}>キャンセル</Button>
            <Button color={confirm === "revoke" ? "red" : undefined} onClick={changeInvitation}>{confirm === "reissue" ? "再発行する" : "無効化する"}</Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  )
}
