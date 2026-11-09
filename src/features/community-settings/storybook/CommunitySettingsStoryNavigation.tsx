"use client"

import { useState } from "react"
import { showNotification } from "@/components/Feedback"
import { CommunitySettingsView, type CommunitySettingsViewProps } from "../CommunitySettingsView"
import { CommunityPreferencesContent } from "../preferences/CommunityPreferencesContent"
import type { CommunitySettingsSection } from "../communitySettingsSections"


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
}: CommunitySettingsViewProps) {
  const [currentSection, setCurrentSection] =
    useState<CommunitySettingsSection>(section)
  const [accent, setAccent] = useState("#7950f2")
  const simulatedInvitation = useCommunityStoryInvitation(props.communityId ?? "photo-club", invitationMode === "preview")

  return (
    <CommunitySettingsView
      {...props}
      section={currentSection}
      invitationMode={invitationMode}
      invitation={suppliedInvitation ?? simulatedInvitation}
      preferencesContent={preferencesContent ?? <CommunityPreferencesContent accent={accent} setAccent={setAccent} />}
      onSectionChange={(next) => setCurrentSection(next)}
    />
  )
}
