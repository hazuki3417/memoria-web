"use client"

import { useApolloClient } from "@apollo/client"
import { CommunityDetailsDocument } from "@/infrastructure/graphql/generated"

/** Inspect Community name independently of Apollo cache updates. */
export function useCommunityNameInspection(communityId: string) {
  const client = useApolloClient()

  return async () => {
    const current = await client.query({
      query: CommunityDetailsDocument,
      variables: { communityId },
      fetchPolicy: "no-cache",
    })
    if (!current.data?.community) throw new Error("Community not available")
    return current.data.community.name
  }
}
