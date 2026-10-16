"use server"

import { auth0 } from "@/lib/auth0"
import { getCurrentMemoriaUser, getMemoriaCommunity, getMemoriaCommunityMembers, changeMemoriaCommunityMemberRole, removeMemoriaCommunityMember, leaveMemoriaCommunity, renameMemoriaCommunity } from "@/infrastructure/graphql"

export async function getCommunityDetailsAction(communityId: string) {
  if (!(await auth0.getSession())) return { kind: "unavailable" as const }
  return getMemoriaCommunity(communityId)
}

export async function renameCommunityAction(communityId: string, name: string) {
  if (!(await auth0.getSession())) return { kind: "unavailable" as const }
  if (!name.trim()) return { kind: "validation" as const }
  return renameMemoriaCommunity(communityId, name.trim())
}

export async function getCommunityMembersAction(communityId: string) {
  if (!(await auth0.getSession())) return { kind: "unavailable" as const }
  const [membersResult, userResult] = await Promise.all([
    getMemoriaCommunityMembers(communityId),
    getCurrentMemoriaUser(),
  ])
  if (membersResult.kind !== "loaded") return membersResult
  if (userResult.kind !== "active") return { kind: "unavailable" as const }
  return { kind: "loaded" as const, members: membersResult.members, currentUserId: userResult.user.id }
}

export async function changeCommunityMemberRoleAction(
  communityId: string, userId: string, role: "admin" | "member",
) {
  if (!(await auth0.getSession())) return { kind: "unavailable" as const }
  return changeMemoriaCommunityMemberRole(communityId, userId, role)
}

export async function removeCommunityMemberAction(communityId: string, userId: string) {
 if (!(await auth0.getSession())) return { kind: "unavailable" as const }
 return removeMemoriaCommunityMember(communityId, userId)
}

export async function leaveCommunityAction(communityId: string) {
 if (!(await auth0.getSession())) return { kind: "unavailable" as const }
 return leaveMemoriaCommunity(communityId)
}
