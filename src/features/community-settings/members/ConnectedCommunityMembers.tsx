"use client"

import { useCommunitySettingsMembersQuery } from "@/infrastructure/graphql/generated"
import type { SettingsSectionRender } from "@/ui/SettingsSectionHost"
import { CommunityMembers, type CommunityMember } from "./index"
import { useCommunityMemberRemovalAction } from "./useCommunityMemberRemovalAction"
import { useCommunityLeaveAction } from "./useCommunityLeaveAction"
import { useCommunityRoleChangeAction } from "./useCommunityRoleChangeAction"
import { useCommunitySettingsRefreshError } from "../useCommunitySettingsRefreshError"

/** Members owns only the selected listing and relevant member actions. */
export function ConnectedCommunityMembers({
  communityId,
  onLeaveSuccess,
  render,
}: {
  communityId: string
  onLeaveSuccess: () => void
  render: SettingsSectionRender
}) {
  const query = useCommunitySettingsMembersQuery({
    variables: { communityId },
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  })
  const { onRemoveMember } = useCommunityMemberRemovalAction(communityId)
  const { onLeaveCommunity } = useCommunityLeaveAction(communityId)
  const { onChangeMemberRole } = useCommunityRoleChangeAction(communityId)
  const members = query.data?.communityMembers
  const selfId = query.data?.me?.id
  const ready = Boolean(query.data?.community && members && selfId !== undefined)

  useCommunitySettingsRefreshError(Boolean(ready && query.error))
  if (!ready || !members || selfId === undefined) {
    return render(
      query.loading
        ? { status: "loading" }
        : {
            status: "error",
            retry: () => { void query.refetch().catch(() => undefined) },
          },
    )
  }

  const viewMembers: CommunityMember[] = members.map((member) => ({
    id: member.userId,
    name: member.nickname,
    role: member.role,
    isSelf: member.userId === selfId,
  }))

  return render({
    status: "ready",
    content: (
      <CommunityMembers
        members={viewMembers}
        onChangeRole={onChangeMemberRole}
        onRemoveMember={onRemoveMember}
        onLeave={onLeaveCommunity}
        onLeaveSuccess={onLeaveSuccess}
      />
    ),
  })
}
