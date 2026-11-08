"use client"

import { ConnectedCommunityPreferences } from "../preferences/ConnectedCommunityPreferences"
import { useCommunitySettingsActions } from "../useCommunitySettingsActions"
import { useCommunitySettingsData } from "../useCommunitySettingsData"
import type { ReactNode } from "react"
import { PageStatusBoundary } from "@/components/PageStatusBoundary/PageStatusBoundary"
import { LoadingBoundary } from "@/components/LoadingBoundary/LoadingBoundary"
import { useRouter } from "next/navigation"
import { useApolloClient } from "@apollo/client"
import { CommunityDetailsDocument } from "@/infrastructure/graphql/generated"
import {
  CommunitySettings,
  type CommunitySettingsSection,
} from "../CommunitySettings"

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
  const client = useApolloClient()
  const { communityAccentColor, membershipLost, name, members, loadState } =
    useCommunitySettingsData(communityId, section)
  const { onRemoveMember, onLeaveCommunity, onChangeMemberRole, onSaveName } =
    useCommunitySettingsActions(communityId)

  if (membershipLost)
    return (
      <LoadingBoundary loading label="Communityの利用権限を確認中">
        {null}
      </LoadingBoundary>
    )

  return (
    <CommunitySettings
      key={communityId}
      communityId={communityId}
      invitationMode="unavailable"
      communityAccentColor={communityAccentColor}
      communityName={name ?? undefined}
      contentOverride={
        loadState !== "ready" ? (
          <PageStatusBoundary
            state={loadState}
            label="Community設定を読み込み中"
          >
            {null}
          </PageStatusBoundary>
        ) : undefined
      }
      members={members ?? undefined}
      role={members?.find((member) => member.isSelf)?.role ?? "member"}
      section={section}
      usageContent={usageContent}
      preferencesContent={
        section === "preferences" ? (
          <ConnectedCommunityPreferences communityId={communityId} />
        ) : undefined
      }
      onRemoveMember={onRemoveMember}
      onLeaveCommunity={onLeaveCommunity}
      onLeaveSuccess={() => router.push("/dashboard")}
      onChangeMemberRole={onChangeMemberRole}
      onNavigate={(href) => router.push(href)}
      onSaveName={onSaveName}
      onInspectName={async () => {
        const current = await client.query({
          query: CommunityDetailsDocument,
          variables: { communityId },
          fetchPolicy: "no-cache",
        })
        if (!current.data?.community) throw new Error("Community not available")
        return current.data.community.name
      }}
    />
  )
}
