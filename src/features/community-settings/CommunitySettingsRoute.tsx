"use client"

import { Text } from "@mantine/core"
import { LoadingBoundary } from "@/components/LoadingBoundary/LoadingBoundary"
import { useRouter } from "next/navigation"
import { showNotification } from "@/components/Feedback"
import { changeCommunityMemberRoleAction, removeCommunityMemberAction, leaveCommunityAction, renameCommunityAction } from "./actions"
import { useCommunity } from "@/features/community/CommunityProvider"
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
  const { name, members, loadError, membersError, setName, setMembers } = useCommunity()

  const pending = !loadError && !membersError && (name === null || members === null)

  if (loadError) return <Text c="red">Community情報を取得できませんでした。再読み込みしてください。</Text>
  if (membersError) return <Text c="red">メンバー一覧を取得できませんでした。再読み込みしてください。</Text>
  if (pending) return <LoadingBoundary loading label="Community設定を読み込み中">{null}</LoadingBoundary>
  if (name === null || members === null) return null

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
