"use client"

import type { ReactNode } from "react"

import { useEffect, useState } from "react"
import {
  CommunityMembersContent,
  type CommunityMember,
} from "./CommunityMembersContent"
import { useMediaQuery } from "@mantine/hooks"
import {
  IconSettings,
  IconUsers,
  IconChartBar,
  IconAdjustments,
} from "@tabler/icons-react"
import { SettingsSectionLayout, SettingsSectionNavigation } from "@/components/SettingsSectionLayout"
import { CommunityGeneralContent } from "./CommunityGeneralContent"
import { CommunityPreferencesContent } from "./CommunityPreferencesContent"
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
    <CommunityGeneralContent
      isAdmin={isAdmin}
      communityId={communityId}
      draft={draft}
      setDraft={setDraft}
      invalid={invalid}
      dirty={dirty}
      savingName={savingName}
      setSavingName={setSavingName}
      setName={setName}
      onSaveName={onSaveName}
      active={active}
      invitation={invitation}
      invitationUrl={invitationUrl}
      expiresAt={expiresAt}
      busy={busy}
      issue={issue}
      copyInvitation={copyInvitation}
      confirm={confirm}
      setConfirm={setConfirm}
      changeInvitation={changeInvitation}
    />
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
  const preferencesContent = (
    <CommunityPreferencesContent accent={accent} setAccent={setAccent} />
  )
  const content =
    currentSection === "general"
      ? generalContent
      : currentSection === "members"
        ? membersContent
        : currentSection === "usage"
          ? usageContent
          : preferencesContent

  return (
    <SettingsSectionLayout
      compact={compact}
      wrapCompactContent={false}
      navigation={
        <SettingsSectionNavigation
          section={currentSection}
          sections={sections}
          compact={compact}
          ariaLabel="Community設定画面"
          desktopAriaLabel="Community設定"
          accentColor="var(--mantine-color-violet-6)"
          onSectionChange={(value) => {
            const target = sections.find((item) => item.id === value)
            if (target && target.id !== currentSection) navigate(target)
          }}
        />
      }
    >
      {content}
    </SettingsSectionLayout>
  )
}
