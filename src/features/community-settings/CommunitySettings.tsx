"use client"

import type { ReactNode } from "react"

import { useEffect, useState } from "react"
import {
  CommunityMembersContent,
  type CommunityMember,
} from "./CommunityMembersContent"
import {
  SettingsUsage,
  type SettingsUsageData,
} from "@/features/usage"
import { useMediaQuery } from "@mantine/hooks"
import {
  IconSettings,
  IconUsers,
  IconChartBar,
  IconAdjustments,
} from "@tabler/icons-react"
import { NavigationItem } from "@/components/NavigationItem"
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
  Select,
} from "@mantine/core"
import { IconCopy } from "@tabler/icons-react"
import { PageHeader } from "@/components/PageHeader"
import { SectionHeader } from "@/components/SectionHeader"
import { showNotification } from "@/components/Feedback"

export type CommunitySettingsSection =
  | "general"
  | "members"
  | "usage"
  | "preferences"
type Role = "admin" | "member"
type InvitationState = "none" | "active" | "expired" | "revoked"

export function CommunitySettings({
  role = "admin",
  communityId = "photo-club",
  section = "general",
  onNavigate,
  communityName,
  onSaveName,
  members,
  onChangeMemberRole,
  onRemoveMember,
  onLeaveCommunity,
  onLeaveSuccess,
  fileSizeUnit = "DECIMAL",
  usageContent,
}: {
  role?: Role
  communityId?: string
  section?: CommunitySettingsSection
  onNavigate?: (href: string) => void
  communityName?: string
  onSaveName?: (name: string) => Promise<boolean>
  members?: CommunityMember[]
  onChangeMemberRole?: (userId: string, role: Role) => Promise<boolean>
  onRemoveMember?: (userId: string) => Promise<boolean>
  onLeaveCommunity?: () => Promise<void>
  onLeaveSuccess?: () => void
  fileSizeUnit?: "DECIMAL" | "BINARY"
  usageContent?: ReactNode
}) {
  const [previewSection, setPreviewSection] =
    useState<CommunitySettingsSection>(section)
  const currentSection = onNavigate ? section : previewSection
  const navigate = (target: (typeof sections)[number]) => {
    if (onNavigate) onNavigate(target.href)
    else setPreviewSection(target.id as CommunitySettingsSection)
  }
  const compact = useMediaQuery("(max-width: 48em)")
  const isAdmin = role === "admin"
  const [name, setName] = useState(communityName ?? "家族のアルバム")
  const [draft, setDraft] = useState(name)
  const [savingName, setSavingName] = useState(false)
  useEffect(() => {
    if (communityName === undefined) return
    setName(communityName)
    setDraft(communityName)
  }, [communityName])
  const [invitation, setInvitation] = useState<InvitationState>("none")
  const [expiresAt, setExpiresAt] = useState("")
  const [generation, setGeneration] = useState(0)
  const [confirm, setConfirm] = useState<"reissue" | "revoke" | null>(null)
  const [busy, setBusy] = useState(false)
  const [accent, setAccent] = useState("#7950f2")
  const invitationUrl = `https://example.com/invitations/${communityId}-demo-${generation}`
  const active = invitation === "active"
  const dirty = draft.trim() !== name
  const invalid = !draft.trim()

  const issue = () => {
    setBusy(true)
    setGeneration((current) => current + 1)
    setInvitation("active")
    setExpiresAt(
      new Date(Date.now() + 7 * 86400000)
        .toLocaleString("sv-SE", { timeZone: "Asia/Tokyo", hour12: false })
        .replace("T", " ")
        .replaceAll("-", "/"),
    )
    setBusy(false)
    showNotification({
      kind: "success",
      title: "招待URLを発行",
      description: "招待URLを発行しました。",
    })
  }

  const changeInvitation = () => {
    if (confirm === "revoke") {
      setInvitation("revoked")
      setExpiresAt("")
      showNotification({
        kind: "success",
        title: "招待URLを無効化",
        description: "招待URLを無効化しました。",
      })
    } else {
      issue()
    }
    setConfirm(null)
  }

  const copyInvitation = async () => {
    if (!active) return
    try {
      await navigator.clipboard.writeText(invitationUrl)
      showNotification({
        kind: "success",
        title: "招待URLをコピー",
        description: "招待URLをコピーしました。",
      })
    } catch {
      showNotification({
        kind: "error",
        title: "招待URLをコピー",
        description: "コピーに失敗しました。",
      })
    }
  }

  const sections = [
    {
      id: "general",
      label: "一般",
      icon: IconAdjustments,
      href: `/communities/${encodeURIComponent(communityId)}/settings`,
    },
    {
      id: "members",
      label: "メンバー",
      icon: IconUsers,
      href: `/communities/${encodeURIComponent(communityId)}/members`,
    },
    {
      id: "preferences",
      label: "環境設定",
      icon: IconSettings,
      href: `/communities/${encodeURIComponent(communityId)}/preferences`,
    },
    {
      id: "usage",
      label: "利用状況",
      icon: IconChartBar,
      href: `/communities/${encodeURIComponent(communityId)}/usage`,
    },
  ]

  const generalContent = (
    <Stack gap="xl">
      <PageHeader
        title="Community Settings"
        description="Communityの基本情報と管理"
      />

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
              <Button
                size="sm"
                disabled={!dirty || invalid || savingName}
                loading={savingName}
                onClick={() => {
                  if (savingName) return
                  const updated = draft.trim()
                  if (!onSaveName) {
                    setName(updated)
                    setDraft(updated)
                    showNotification({
                      kind: "success",
                      title: "Community名を変更",
                      description: "Community名を変更しました。",
                    })
                    return
                  }
                  setSavingName(true)
                  void onSaveName(updated)
                    .then((saved) => {
                      if (!saved) return
                      setName(updated)
                      setDraft(updated)
                      showNotification({
                        kind: "success",
                        title: "Community名を変更",
                        description: "Community名を変更しました。",
                      })
                    })
                    .finally(() => setSavingName(false))
                }}
              >
                保存
              </Button>
            </Box>
          )}
        </Stack>
      </Box>

      <Box>
        <SectionHeader>招待URL</SectionHeader>
        <Stack gap="md" maw={540}>
          <Box>
            <Badge variant="light">
              {active
                ? "有効"
                : invitation === "expired"
                  ? "期限切れ"
                  : invitation === "revoked"
                    ? "無効化済み"
                    : "未発行"}
            </Badge>
          </Box>
          <TextInput
            label="招待URL"
            value={active ? invitationUrl : "-"}
            readOnly
            rightSection={
              <ActionIcon
                variant="subtle"
                aria-label="招待URLをコピー"
                title="招待URLをコピー"
                disabled={!active}
                onClick={() => {
                  void copyInvitation()
                }}
              >
                <IconCopy size={16} />
              </ActionIcon>
            }
            rightSectionPointerEvents="all"
          />
          <Text size="sm" c="dimmed">
            有効期限: {active ? expiresAt : "----/--/-- --:--:--"}
          </Text>
          {isAdmin ? (
            <Group gap="sm">
              {!active ? (
                <Button size="sm" loading={busy} onClick={issue}>
                  招待URLを発行
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => setConfirm("reissue")}
                  >
                    再発行
                  </Button>
                  <Button
                    size="sm"
                    color="red"
                    variant="outline"
                    onClick={() => setConfirm("revoke")}
                  >
                    無効化
                  </Button>
                </>
              )}
            </Group>
          ) : (
            <Text size="sm" c="dimmed">
              招待URLの発行と管理はAdministratorのみ行えます。
            </Text>
          )}
        </Stack>
      </Box>

      {isAdmin && (
        <Box>
          <Box c="red">
            <SectionHeader>Community削除</SectionHeader>
          </Box>
          <Stack gap="md" maw={620}>
            <Text size="sm">
              Communityの削除は元に戻せません。Community管理Mediaも削除対象になります。
            </Text>
            <Box>
              <Button
                color="red"
                variant="default"
                size="sm"
                component="a"
                href={`/communities/${encodeURIComponent(communityId)}/settings/delete`}
              >
                Communityを削除する
              </Button>
            </Box>
          </Stack>
        </Box>
      )}

      <Modal
        opened={confirm !== null}
        onClose={() => setConfirm(null)}
        title={confirm === "reissue" ? "招待URLを再発行" : "招待URLを無効化"}
        centered
      >
        <Stack>
          <Text size="sm">
            現在の招待URLは利用できなくなります。共有済みのURLからも参加できなくなります。
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setConfirm(null)}>
              キャンセル
            </Button>
            <Button
              color={confirm === "revoke" ? "red" : undefined}
              onClick={changeInvitation}
            >
              {confirm === "reissue" ? "再発行する" : "無効化する"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )

  const membersContent = (
    <CommunityMembersContent
      members={members}
      onChangeRole={onChangeMemberRole}
      onRemoveMember={onRemoveMember}
      onLeave={onLeaveCommunity}
      onLeaveSuccess={onLeaveSuccess}
    />
  )
  const communityUsage: SettingsUsageData = {
  usedBytes: 1_240_000_000,
  limitBytes: 5_000_000_000,
  mediaCount: 1248,
  formatBreakdown: [
    { format: "JPEG", count: 900, sizeBytes: 900_000_000 },
    { format: "PNG", count: 200, sizeBytes: 200_000_000 },
    { format: "WebP", count: 100, sizeBytes: 100_000_000 },
    { format: "HEIC / HEIF", count: 48, sizeBytes: 40_000_000 },
  ],
}
  const defaultUsageContent = (
    <SettingsUsage scope="community" usage={communityUsage} fileSizeUnit={fileSizeUnit} />
  )
  const preferencesContent = (
    <Stack gap="xl">
      <PageHeader
        title="環境設定"
        description="このCommunityでの自分専用の表示設定です。他のメンバーには影響しません。"
      />
      <Box>
        <SectionHeader>アクセントカラー</SectionHeader>
        <Stack gap="sm" maw={540}>
          <Text size="sm" c="dimmed">
            色の選択はプレビューです。保存・Contextへの反映はまだ行われません。
          </Text>
          <Group gap="sm">
            <input
              type="color"
              aria-label="Communityアクセントカラー"
              value={accent}
              onChange={(event) => setAccent(event.currentTarget.value)}
            />
            <Text size="sm">{accent.toUpperCase()}</Text>
          </Group>
        </Stack>
      </Box>
    </Stack>
  )
  const content =
    currentSection === "general"
      ? generalContent
      : currentSection === "members"
        ? membersContent
        : currentSection === "usage"
          ? (usageContent ?? defaultUsageContent)
          : preferencesContent

  return (
    <Box maw={1120} mx="auto" w="100%">
      {compact ? (
        <Stack gap="xl">
          <Box>
            <Text size="xs" c="dimmed" mb={6}>
              設定
            </Text>
            <Select
              aria-label="Community設定画面"
              value={currentSection}
              allowDeselect={false}
              data={sections.map(({ id, label }) => ({ value: id, label }))}
              onChange={(value) => {
                const target = sections.find((item) => item.id === value)
                if (target && target.id !== currentSection) navigate(target)
              }}
            />
          </Box>
          {content}
        </Stack>
      ) : (
        <Group align="flex-start" gap={56} wrap="nowrap">
          <Box
            component="nav"
            aria-label="Community設定"
            w={200}
            style={{ flexShrink: 0 }}
          >
            <Text size="xs" fw={700} c="dimmed" mb="xs">
              設定
            </Text>
            <Stack gap={0}>
              {sections.map((item) => (
                <NavigationItem
                  key={item.id}
                  label={item.label}
                  icon={item.icon}
                  active={item.id === currentSection}
                  accentColor="var(--mantine-color-violet-6)"
                  onClick={() => {
                    if (item.id !== currentSection) navigate(item)
                  }}
                />
              ))}
            </Stack>
          </Box>
          <Box style={{ flex: 1 }} maw={760} miw={0}>
            {content}
          </Box>
        </Group>
      )}
    </Box>
  )
}
