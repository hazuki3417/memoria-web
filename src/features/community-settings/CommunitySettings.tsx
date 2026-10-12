"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMediaQuery } from "@mantine/hooks"
import { IconSettings, IconUsers, IconChartBar, IconPalette } from "@tabler/icons-react"
import { NavigationItem } from "@/components/NavigationItem"
import { ActionIcon, Badge, Box, Button, Group, Modal, Stack, Text, TextInput, Select } from "@mantine/core"
import { IconCopy } from "@tabler/icons-react"
import { PageHeader } from "@/components/PageHeader"
import { SectionHeader } from "@/components/SectionHeader"
import { showNotification } from "@/components/Feedback"

type Role = "admin" | "member"
type InvitationState = "none" | "active" | "expired" | "revoked"

export function CommunitySettings({
  role = "admin",
  communityId = "photo-club",
}: {
  role?: Role
  communityId?: string
}) {
  const router = useRouter()
  const compact = useMediaQuery("(max-width: 48em)")
  const isAdmin = role === "admin"
  const [name, setName] = useState("家族のアルバム")
  const [draft, setDraft] = useState(name)
  const [invitation, setInvitation] = useState<InvitationState>("none")
  const [expiresAt, setExpiresAt] = useState("")
  const [generation, setGeneration] = useState(0)
  const [confirm, setConfirm] = useState<"reissue" | "revoke" | null>(null)
  const [busy, setBusy] = useState(false)
  const invitationUrl = `https://example.com/invitations/${communityId}-demo-${generation}`
  const active = invitation === "active"
  const dirty = draft.trim() !== name
  const invalid = !draft.trim()

  const issue = () => {
    setBusy(true)
    setGeneration((current) => current + 1)
    setInvitation("active")
    setExpiresAt(new Date(Date.now() + 7 * 86400000).toLocaleString("sv-SE", { timeZone: "Asia/Tokyo", hour12: false }).replace("T", " ").replaceAll("-", "/"))
    setBusy(false)
    showNotification({ kind: "success", title: "招待URLを発行しました", message: "Prototype上の操作です。" })
  }

  const changeInvitation = () => {
    if (confirm === "revoke") {
      setInvitation("revoked")
      setExpiresAt("")
      showNotification({ kind: "success", title: "招待URLを無効化しました", message: "Prototype上の操作です。" })
    } else {
      issue()
    }
    setConfirm(null)
  }

  const copyInvitation = async () => {
    if (!active) return
    try {
      await navigator.clipboard.writeText(invitationUrl)
      showNotification({ kind: "success", title: "招待URLをコピーしました" })
    } catch {
      showNotification({ kind: "error", title: "コピーに失敗しました" })
    }
  }

  const sections = [
    { id: "general", label: "一般", icon: IconSettings, href: `/communities/${encodeURIComponent(communityId)}/settings` },
    { id: "members", label: "メンバー", icon: IconUsers, href: `/communities/${encodeURIComponent(communityId)}/members` },
    { id: "usage", label: "利用状況", icon: IconChartBar, href: `/communities/${encodeURIComponent(communityId)}/usage` },
    { id: "preferences", label: "環境設定", icon: IconPalette, href: `/communities/${encodeURIComponent(communityId)}/preferences` },
  ]

  const content = (
    <Stack gap="xl">
      <PageHeader title="Community Settings" description="Communityの基本情報と管理" />

      <Box>
        <SectionHeader>基本情報</SectionHeader>
        <Stack gap="md" maw={540}>
          <TextInput
            label="Community名"
            value={draft}
            onChange={(event) => setDraft(event.currentTarget.value)}
            error={invalid ? "Community名を入力してください" : undefined}
            disabled={!isAdmin}
            required
          />
          {isAdmin && (
            <Box>
              <Button size="sm" disabled={!dirty || invalid} onClick={() => {
                const updated = draft.trim()
                setName(updated)
                setDraft(updated)
                showNotification({ kind: "success", title: "Community名を変更しました", message: "Prototype上の操作です。" })
              }}>保存</Button>
            </Box>
          )}
        </Stack>
      </Box>

      <Box>
        <SectionHeader>招待URL</SectionHeader>
        <Stack gap="md" maw={540}>
          <Box><Badge variant="light">{active ? "有効" : invitation === "expired" ? "期限切れ" : invitation === "revoked" ? "無効化済み" : "未発行"}</Badge></Box>
          <TextInput
            label="招待URL"
            value={active ? invitationUrl : "-"}
            readOnly
            rightSection={
              <ActionIcon variant="subtle" aria-label="招待URLをコピー" title="招待URLをコピー" disabled={!active} onClick={() => { void copyInvitation() }}>
                <IconCopy size={16} />
              </ActionIcon>
            }
            rightSectionPointerEvents="all"
          />
          <Text size="sm" c="dimmed">有効期限: {active ? expiresAt : "----/--/-- --:--:--"}</Text>
          {isAdmin ? (
            <Group gap="sm">
              {!active ? (
                <Button size="sm" loading={busy} onClick={issue}>招待URLを発行</Button>
              ) : (
                <>
                  <Button size="sm" variant="default" onClick={() => setConfirm("reissue")}>再発行</Button>
                  <Button size="sm" color="red" variant="outline" onClick={() => setConfirm("revoke")}>無効化</Button>
                </>
              )}
            </Group>
          ) : (
            <Text size="sm" c="dimmed">招待URLの発行と管理はAdministratorのみ行えます。</Text>
          )}
        </Stack>
      </Box>

      {isAdmin && (
        <Box>
          <Box c="red"><SectionHeader>Community削除</SectionHeader></Box>
          <Stack gap="md" maw={620}>
            <Text size="sm">Communityの削除は元に戻せません。Community管理Mediaも削除対象になります。</Text>
            <Box>
              <Button color="red" variant="default" size="sm" component="a" href={`/communities/${encodeURIComponent(communityId)}/settings/delete`}>Communityを削除する</Button>
            </Box>
          </Stack>
        </Box>
      )}

      <Modal opened={confirm !== null} onClose={() => setConfirm(null)} title={confirm === "reissue" ? "招待URLを再発行" : "招待URLを無効化"} centered>
        <Stack>
          <Text size="sm">現在の招待URLは利用できなくなります。共有済みのURLからも参加できなくなります。</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setConfirm(null)}>キャンセル</Button>
            <Button color={confirm === "revoke" ? "red" : undefined} onClick={changeInvitation}>{confirm === "reissue" ? "再発行する" : "無効化する"}</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )

  return (
    <Box maw={1120} mx="auto" w="100%">
      {compact ? (
        <Stack gap="xl">
          <Box>
            <Text size="xs" c="dimmed" mb={6}>設定</Text>
            <Select aria-label="Community設定画面" value="general" allowDeselect={false}
              data={sections.map(({ id, label }) => ({ value: id, label }))}
              onChange={(value) => {
                const target = sections.find((item) => item.id === value)
                if (target && target.id !== "general") router.push(target.href)
              }} />
          </Box>
          {content}
        </Stack>
      ) : (
        <Group align="flex-start" gap={56} wrap="nowrap">
          <Box component="nav" aria-label="Community設定" w={200} style={{ flexShrink: 0 }}>
            <Text size="xs" fw={700} c="dimmed" mb="xs">設定</Text>
            <Stack gap={0}>
              {sections.map((item) => (
                <NavigationItem key={item.id} label={item.label} icon={item.icon}
                  active={item.id === "general"} accentColor="var(--mantine-color-violet-6)"
                  onClick={() => { if (item.id !== "general") router.push(item.href) }} />
              ))}
            </Stack>
          </Box>
          <Box style={{ flex: 1 }} maw={760} miw={0}>{content}</Box>
        </Group>
      )}
    </Box>
  )
}
