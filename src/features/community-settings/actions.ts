"use server"

import { auth0 } from "@/lib/auth0"
import { changeMemoriaCommunityMemberRole, removeMemoriaCommunityMember, leaveMemoriaCommunity, renameMemoriaCommunity, getMemoriaCommunityDeletionSnapshot } from "@/infrastructure/graphql"

export async function renameCommunityAction(communityId: string, name: string) {
  if (!(await auth0.getSession())) return { kind: "unavailable" as const }
  if (!name.trim()) return { kind: "validation" as const }
  return renameMemoriaCommunity(communityId, name.trim())
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

export async function getCommunityDeletionSnapshotAction(communityId: string) {
  if (!(await auth0.getSession())) return { kind: "unavailable" as const }
  return getMemoriaCommunityDeletionSnapshot(communityId)
}
