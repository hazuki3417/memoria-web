"use client"

import { ConnectedCommunityPreferences } from "./ConnectedCommunityPreferences"
import { useEffect, type ReactNode } from "react"
import { SettingsLoadBoundary } from "@/features/settings/SettingsLoadBoundary"
import { LoadingBoundary } from "@/components/LoadingBoundary/LoadingBoundary"
import { useRouter } from "next/navigation"
import { showNotification } from "@/components/Feedback"
import {
  MyCommunitiesDocument,
  useMyCommunitiesQuery,
  CommunityMembersDocument,
  CommunityMemberRole,
  useRenameCommunityMutation,
  useChangeCommunityMemberRoleMutation,
  useRemoveCommunityMemberMutation,
  useLeaveCommunityMutation,
} from "@/infrastructure/graphql/generated"
import { useCommunity } from "@/features/community/CommunityProvider"
import {
  CommunitySettings,
  type CommunitySettingsSection,
} from "./CommunitySettings"

export function CommunitySettingsRoute({
  communityId,
  section = "general",
  usageContent,
}: {
  communityId: string
  section?: CommunitySettingsSection
  usageContent?: ReactNode
}) {
  const router = useRouter()
  const {
    data: accentData,
    loading: accentLoading,
    error: accentError,
  } = useMyCommunitiesQuery()
  const activeMembership = accentData?.myCommunities.find(
    (item) => item.id === communityId,
  )
  const communityAccentColor = activeMembership?.mySettings.accentColor
  const membershipLost =
    section === "preferences" &&
    !accentLoading &&
    !accentError &&
    !!accentData &&
    !activeMembership
  useEffect(() => {
    if (membershipLost) router.replace("/dashboard")
  }, [membershipLost, router])
  // UsageはCommunityの登録量を閲覧する画面であり、メンバー一覧を必要としない。
  const requiresMembers = section === "members" || section === "general"
  const { name, members, loadError, membersError } = useCommunity({
    includeMembers: requiresMembers,
  })
  const [renameCommunity] = useRenameCommunityMutation()
  const [changeRole] = useChangeCommunityMemberRoleMutation()
  const [removeMember] = useRemoveCommunityMemberMutation()
  const [leaveCommunity] = useLeaveCommunityMutation()

  const pending =
    !loadError &&
    !(requiresMembers && membersError) &&
    (name === null || (requiresMembers && members === null))

  if (membershipLost)
    return (
      <LoadingBoundary loading label="Communityの利用権限を確認中">
        {null}
      </LoadingBoundary>
    )
  const loadState = loadError || (requiresMembers && membersError)
    ? "error"
    : pending ? "loading" : "ready"

  return (
    <CommunitySettings
      communityId={communityId}
      communityAccentColor={communityAccentColor}
      communityName={name ?? undefined}
      contentOverride={loadState !== "ready" ? <SettingsLoadBoundary state={loadState} label="Community設定を読み込み中">{null}</SettingsLoadBoundary> : undefined}
      members={members ?? undefined}
      role={members?.find((member) => member.isSelf)?.role ?? "member"}
      section={section}
      usageContent={usageContent}
      preferencesContent={
        section === "preferences" ? (
          <ConnectedCommunityPreferences communityId={communityId} />
        ) : undefined
      }
      onRemoveMember={async (userId) => {
        try {
          const result = await removeMember({
            variables: { input: { communityId, userId } },
            refetchQueries: [CommunityMembersDocument],
            awaitRefetchQueries: true,
          })
          if (!result.data?.removeCommunityMember.success) {
            showNotification({
              kind: "error",
              title: "メンバーを除外",
              description: "メンバーを除外できませんでした。",
            })
            return false
          }
          showNotification({
            kind: "success",
            title: "メンバーを除外",
            description: "メンバーを除外しました。",
          })
          return true
        } catch {
          showNotification({
            kind: "error",
            title: "メンバーを除外",
            description: "メンバーを除外できませんでした。",
          })
          return false
        }
      }}
      onLeaveCommunity={async () => {
        const result = await leaveCommunity({
          variables: { communityId },
          refetchQueries: [MyCommunitiesDocument],
          awaitRefetchQueries: true,
        })
        if (!result.data?.leaveCommunity.success)
          throw new Error("leave failed")
      }}
      onLeaveSuccess={() => router.push("/dashboard")}
      onChangeMemberRole={async (userId, role) => {
        try {
          const result = await changeRole({
            variables: {
              input: {
                communityId,
                userId,
                role:
                  role === "admin"
                    ? CommunityMemberRole.Admin
                    : CommunityMemberRole.Member,
              },
            },
            refetchQueries: [CommunityMembersDocument],
            awaitRefetchQueries: true,
          })
          if (!result.data?.changeCommunityMemberRole.success) {
            showNotification({
              kind: "error",
              title: "メンバーの役割を変更",
              description: "メンバーの役割を変更できませんでした。",
            })
            return false
          }
          showNotification({
            kind: "success",
            title: "メンバーの役割を変更",
            description: "メンバーの役割を変更しました。",
          })
          return true
        } catch {
          showNotification({
            kind: "error",
            title: "メンバーの役割を変更",
            description: "メンバーの役割を変更できませんでした。",
          })
          return false
        }
      }}
      onNavigate={(href) => router.push(href)}
      onSaveName={async (nextName) => {
        try {
          const result = await renameCommunity({
            variables: { input: { communityId, name: nextName } },
            refetchQueries: [MyCommunitiesDocument],
            awaitRefetchQueries: true,
          })
          if (result.data?.renameCommunity.community) {
            return true
          }
          showNotification({
            kind: "error",
            title: "Community名を変更",
            description: "Community名を変更できませんでした。",
          })
          return false
        } catch {
          showNotification({
            kind: "error",
            title: "Community名を変更",
            description: "Community名を変更できませんでした。",
          })
          return false
        }
      }}
    />
  )
}
