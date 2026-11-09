"use client"

import { MyCommunitiesDocument, useLeaveCommunityMutation } from "@/infrastructure/graphql/generated"

/** Owns the leave mutation and its required MyCommunities refresh. */
export function useCommunityLeaveAction(communityId: string) {
  const [leaveCommunity] = useLeaveCommunityMutation()

  const onLeaveCommunity = async (): Promise<void> => {
    const result = await leaveCommunity({
      variables: { communityId },
      refetchQueries: [MyCommunitiesDocument],
      awaitRefetchQueries: true,
    })
    if (!result.data?.leaveCommunity.success) throw new Error("leave failed")
  }

  return { onLeaveCommunity }
}
