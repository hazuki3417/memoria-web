"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useCommunityDetailsQuery, useCommunityMembersQuery, useCurrentUserQuery } from "@/infrastructure/graphql/generated"

export type CommunityMember = {
  id: string
  name: string
  role: "admin" | "member"
  isSelf?: boolean
}

type CommunityData = {
  communityId: string
  name: string | null
  members: CommunityMember[] | null
  loadError: boolean
  membersError: boolean
}

// The Context provides route identity only; Apollo owns the server state.
const Context = createContext<string | null>(null)

export function CommunityProvider({ communityId, children }: { communityId: string; children: ReactNode }) {
  return <Context.Provider value={communityId}>{children}</Context.Provider>
}

export function useCommunity(): CommunityData {
  const communityId = useContext(Context)
  if (!communityId) throw new Error("CommunityProvider is required")
  const community = useCommunityDetailsQuery({ variables: { communityId } })
  const members = useCommunityMembersQuery({ variables: { communityId } })
  const currentUser = useCurrentUserQuery()
  return {
    communityId,
    name: community.data?.community?.name ?? null,
    members: members.data?.communityMembers && currentUser.data
      ? members.data.communityMembers.map((member) => ({
          id: member.userId,
          name: member.nickname,
          role: member.role,
          isSelf: member.userId === currentUser.data?.me?.id,
        }))
      : null,
    loadError: Boolean(community.error) || (!community.loading && !!community.data && !community.data.community),
    membersError: Boolean(members.error || currentUser.error),
  }
}
