"use client"

import { useState } from "react"
import { showNotification } from "@/components/Feedback"
import { CommunitySettingsView } from "../CommunitySettingsView"
import type { ReactNode } from "react"
import { CommunityGeneral } from "../general/CommunityGeneral"
import { CommunityMembers } from "../members"
import type { CommunityMember } from "../members"
import type { CommunityInvitationSectionProps } from "../general/CommunityInvitationSection"
import { CommunityPreferences } from "../preferences/CommunityPreferences"
import type { CommunitySettingsSection } from "../communitySettingsSections"
import type { PageStatus } from "@/components/PageStatusBoundary/PageStatusBoundary"


type Role = "admin" | "member"
type InvitationModel = Omit<CommunityInvitationSectionProps, "isAdmin" | "available">

export type CommunitySettingsStoryProps = {
  role?: Role
  communityId?: string
  section?: CommunitySettingsSection
  communityName?: string
  onSaveName?: (name: string) => Promise<string>
  onInspectName?: () => Promise<string>
  members?: CommunityMember[]
  onChangeMemberRole?: (userId: string, role: Role) => Promise<boolean>
  onRemoveMember?: (userId: string) => Promise<boolean>
  onLeaveCommunity?: () => Promise<void>
  onLeaveSuccess?: () => void
  usageContent?: ReactNode
  preferencesContent?: ReactNode
  invitationMode?: "preview" | "unavailable"
  invitation?: InvitationModel
  communityAccentColor?: string
  loadState?: PageStatus
  onSectionChange: (section: CommunitySettingsSection) => void
}

type InvitationState = "none" | "active" | "expired" | "revoked"

/** Storybook専用の招待URLシミュレーション。本番のInvitation APIは扱わない。 */
function useCommunityStoryInvitation(communityId: string, previewEnabled = true) {
  const [invitation, setInvitation] = useState<InvitationState>("none")
  const [expiresAt, setExpiresAt] = useState("")
  const [generation, setGeneration] = useState(0)
  const [confirm, setConfirm] = useState<"reissue" | "revoke" | null>(null)
  const [busy, setBusy] = useState(false)
  const invitationUrl = previewEnabled
    ? `https://example.com/invitations/${communityId}-demo-${generation}`
    : ""
  const active = previewEnabled && invitation === "active"

  const issue = () => {
    if (!previewEnabled) return
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
    if (!previewEnabled) return
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
    if (!previewEnabled || !active) return
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

  return {
    invitation: previewEnabled ? invitation : ("none" as const),
    invitationUrl,
    expiresAt: previewEnabled ? expiresAt : "",
    active,
    busy: previewEnabled ? busy : false,
    issue,
    copyInvitation,
    confirm: previewEnabled ? confirm : null,
    setConfirm: previewEnabled ? setConfirm : (() => undefined),
    changeInvitation,
  }
}

/**
 * Storybook-only adapter: keeps section changes inside Canvas.
 * Production route navigation is supplied independently by CommunitySettingsRoute.
 */
export function CommunitySettingsStoryNavigation({
  section = "general",
  onSectionChange: _onSectionChange,
  preferencesContent,
  invitationMode = "preview",
  invitation: suppliedInvitation,
  ...props
}: CommunitySettingsStoryProps) {
  const [currentSection, setCurrentSection] =
    useState<CommunitySettingsSection>(section)
  const [accent, setAccent] = useState("#7950f2")
  const simulatedInvitation = useCommunityStoryInvitation(props.communityId ?? "photo-club", invitationMode === "preview")

  const communityId = props.communityId ?? "photo-club"
  const invitation = suppliedInvitation ?? simulatedInvitation
  const isAdmin = (props.role ?? "admin") === "admin"
  let content: ReactNode
  switch (currentSection) {
    case "general":
      content = (
        <CommunityGeneral
          name={{
            communityName: props.communityName,
            onSaveName: props.onSaveName,
            onInspectName: props.onInspectName,
          }}
          invitation={invitation}
          invitationAvailable={invitationMode === "preview"}
          communityId={communityId}
          isAdmin={isAdmin}
        />
      )
      break
    case "members":
      content = (
        <CommunityMembers
          members={props.members}
          onChangeRole={props.onChangeMemberRole}
          onRemoveMember={props.onRemoveMember}
          onLeave={props.onLeaveCommunity}
          onLeaveSuccess={props.onLeaveSuccess}
        />
      )
      break
    case "usage":
      content = <>{props.usageContent}</>
      break
    case "preferences":
      content = <>{preferencesContent ?? <CommunityPreferences accent={accent} setAccent={setAccent} />}</>
      break
  }

  return (
    <CommunitySettingsView
      communityId={communityId}
      section={currentSection}
      content={content}
      loadState={props.loadState}
      communityAccentColor={props.communityAccentColor}
      onSectionChange={(next) => setCurrentSection(next)}
    />
  )
}
