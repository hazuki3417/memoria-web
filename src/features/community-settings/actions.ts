"use server"

import { auth0 } from "@/lib/auth0"
import { getMemoriaCommunity, renameMemoriaCommunity } from "@/infrastructure/graphql"

export async function getCommunityDetailsAction(communityId: string) {
  if (!(await auth0.getSession())) return { kind: "unavailable" as const }
  return getMemoriaCommunity(communityId)
}

export async function renameCommunityAction(communityId: string, name: string) {
  if (!(await auth0.getSession())) return { kind: "unavailable" as const }
  if (!name.trim()) return { kind: "validation" as const }
  return renameMemoriaCommunity(communityId, name.trim())
}
