"use server"

import { auth0 } from "@/lib/auth0"
import { createMemoriaCommunity, listMyMemoriaCommunities } from "@/infrastructure/graphql"

export async function listCommunitiesAction() {
  if (!(await auth0.getSession())) return { kind: "unavailable" as const }
  return listMyMemoriaCommunities()
}

export async function createCommunityAction(name: string) {
  if (!(await auth0.getSession())) return { kind: "unavailable" as const }
  if (!name.trim()) return { kind: "validation" as const }
  return createMemoriaCommunity(name.trim())
}
