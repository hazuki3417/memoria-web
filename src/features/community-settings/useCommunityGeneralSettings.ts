"use client"

import { useEffect, useState } from "react"
import { showNotification } from "@/components/Feedback"

type InvitationState = "none" | "active" | "expired" | "revoked"

/**
 * Owns Community General settings state independently of navigation and layout.
 * Keep this hook mounted while changing preview sections so draft and invitation
 * state survive the transition, as in the original screen.
 */
export function useCommunityGeneralSettings({
  communityId,
  communityName,
}: {
  communityId: string
  communityName?: string
}) {
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


  return {
    communityId,
    draft,
    setDraft,
    dirty,
    invalid,
    savingName,
    setSavingName,
    setName,
    invitation,
    invitationUrl,
    expiresAt,
    active,
    busy,
    issue,
    copyInvitation,
    confirm,
    setConfirm,
    changeInvitation,
  }
}
