"use client"

import { useEffect, useState } from "react"
import { Box, Group, Skeleton, Stack, Text } from "@mantine/core"
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

  const [showPending, setShowPending] = useState(false)
  const pending = !loadError && !membersError && (name === null || members === null)
  useEffect(() => {
    if (!pending) {
      setShowPending(false)
      return
    }
    const timer = window.setTimeout(() => setShowPending(true), 300)
    return () => window.clearTimeout(timer)
  }, [pending])

  if (loadError) return <Text c="red">Community情報を取得できませんでした。再読み込みしてください。</Text>
  if (membersError) return <Text c="red">メンバー一覧を取得できませんでした。再読み込みしてください。</Text>
  if (pending) {
    if (!showPending) return null
    return (
      <Box maw={1120} mx="auto" w="100%" aria-busy="true" aria-label="Community設定を読み込み中">
        <Group align="flex-start" gap={56} wrap="nowrap">
          <Stack w={200} gap="md" visibleFrom="sm">
            <Skeleton height={14} width={56} />
            {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} height={34} />)}
          </Stack>
          <Stack style={{ flex: 1 }} gap="xl">
            <Skeleton height={28} width="55%" />
            <Skeleton height={14} width="75%" />
            <Skeleton height={22} width="45%" />
            <Skeleton height={40} />
            <Skeleton height={40} />
          </Stack>
        </Group>
      </Box>
    )
  }


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
