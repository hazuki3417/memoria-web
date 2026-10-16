"use server"

import { auth0 } from "@/lib/auth0"
import { getCurrentMemoriaUser, getMemoriaCommunity, getMemoriaCommunityMembers, renameMemoriaCommunity } from "@/infrastructure/graphql"

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
