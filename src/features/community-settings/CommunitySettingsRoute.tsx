"use client"

import { useEffect, useState } from "react"
import { Text } from "@mantine/core"
import { useRouter } from "next/navigation"
import { showNotification } from "@/components/Feedback"
import { getCommunityDetailsAction, getCommunityMembersAction, changeCommunityMemberRoleAction, removeCommunityMemberAction, leaveCommunityAction, renameCommunityAction } from "./actions"
import type { CommunityMember } from "./CommunityMembersContent"
import {
  CommunitySettings,
  type CommunitySettingsSection,
} from "./CommunitySettings"

export function CommunitySettingsRoute({
  communityId,
  section = "general",
}: {
  communityId: string
  section?: CommunitySettingsSection
}) {
  const router = useRouter()
  const [name, setName] = useState<string | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [members, setMembers] = useState<CommunityMember[] | null>(null)
  const [membersError, setMembersError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setName(null)
    setLoadError(false)
    void getCommunityDetailsAction(communityId).then((result) => {
      if (cancelled) return
      if (result.kind === "loaded") setName(result.community.name)
      else setLoadError(true)
    }).catch(() => { if (!cancelled) setLoadError(true) })
    return () => { cancelled = true }
  }, [communityId])

  useEffect(() => {
    let cancelled = false
    setMembers(null)
    setMembersError(false)
    void getCommunityMembersAction(communityId).then((result) => {
      if (cancelled) return
      if (result.kind !== "loaded") {
        setMembersError(true)
        return
      }
      setMembers(result.members.map((member) => ({
        id: member.userId,
        name: member.nickname,
        role: member.role,
        isSelf: member.userId === result.currentUserId,
      })))
    }).catch(() => { if (!cancelled) setMembersError(true) })
    return () => { cancelled = true }
  }, [communityId])

  if (loadError) return <Text c="red">Community情報を取得できませんでした。再読み込みしてください。</Text>
  if (name === null) return <Text c="dimmed">Community情報を読み込み中です。</Text>
  if (membersError) return <Text c="red">メンバー一覧を取得できませんでした。再読み込みしてください。</Text>
  if (members === null) return <Text c="dimmed">メンバー一覧を読み込み中です。</Text>

  return (
    <CommunitySettings
      communityId={communityId}
      communityName={name}
      members={members ?? undefined}
      role={members.find((member) => member.isSelf)?.role ?? "member"}
      section={section}
      onRemoveMember={async (userId) => {
        try {
          const result = await removeCommunityMemberAction(communityId, userId)
          if (result.kind !== "updated") {
            showNotification({ kind: "error", title: "メンバーを除外", description: "メンバーを除外できませんでした。" })
            return false
          }
          setMembers((current) => current?.filter((member) => member.id !== userId) ?? null)
          showNotification({ kind: "success", title: "メンバーを除外", description: "メンバーを除外しました。" })
          return true
        } catch {
          showNotification({ kind: "error", title: "メンバーを除外", description: "メンバーを除外できませんでした。" })
          return false
        }
      }}
      onLeaveCommunity={async () => {
        const result = await leaveCommunityAction(communityId)
        if (result.kind !== "updated") throw new Error("leave failed")
      }}
      onLeaveSuccess={() => router.push("/dashboard")}
      onChangeMemberRole={async (userId, role) => {
        try {
          const result = await changeCommunityMemberRoleAction(communityId, userId, role)
          if (result.kind !== "updated") {
            showNotification({ kind: "error", title: "メンバーの役割を変更", description: "メンバーの役割を変更できませんでした。" })
            return false
          }
          setMembers((current) => current?.map((member) => member.id === userId ? {...member, role} : member) ?? null)
          showNotification({ kind: "success", title: "メンバーの役割を変更", description: "メンバーの役割を変更しました。" })
          return true
        } catch {
          showNotification({ kind: "error", title: "メンバーの役割を変更", description: "メンバーの役割を変更できませんでした。" })
          return false
        }
      }}
      onNavigate={(href) => router.push(href)}
      onSaveName={async (nextName) => {
        try {
          const result = await renameCommunityAction(communityId, nextName)
          if (result.kind === "updated") {
            setName(result.community.name)
            window.dispatchEvent(new CustomEvent("memoria:community-renamed", {
              detail: { id: result.community.id, name: result.community.name },
            }))
            return true
          }
          showNotification({
            kind: "error",
            title: "Community名を変更",
            description: result.kind === "forbidden" ? "Community名を変更する権限がありません。" : "Community名を変更できませんでした。",
          })
          return false
        } catch {
          showNotification({ kind: "error", title: "Community名を変更", description: "Community名を変更できませんでした。" })
          return false
        }
      }}
    />
  )
}
