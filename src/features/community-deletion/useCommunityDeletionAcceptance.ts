"use client"

import {
  MyCommunitiesDocument,
  useAcceptCommunityDeletionMutation,
} from "@/infrastructure/graphql/generated"

/**
 * Community削除の受理MutationとReviewの競合判定を所有する。
 * 既存のMutation/Refetchの結合OutcomeとUnknownの扱いを維持する。
 */
export function useCommunityDeletionAcceptance(communityId: string) {
  const [accept] = useAcceptCommunityDeletionMutation()

  const acceptDeletion = async (revision: string): Promise<void> => {
    try {
      const result = await accept({
        variables: { input: { communityId, revision } },
        refetchQueries: [MyCommunitiesDocument],
        awaitRefetchQueries: true,
      })
      if (!result.data?.acceptCommunityDeletion.accepted)
        throw new Error("ACCEPTANCE_UNCONFIRMED")
    } catch (caught) {
      const graphError = caught as {
        graphQLErrors?: Array<{ extensions?: { code?: string } }>
      }
      if (
        graphError.graphQLErrors?.some(
          (item) => item.extensions?.code === "CONFLICT",
        )
      )
        throw new Error("REVIEW_CHANGED")
      throw caught
    }
  }

  return { acceptDeletion }
}
