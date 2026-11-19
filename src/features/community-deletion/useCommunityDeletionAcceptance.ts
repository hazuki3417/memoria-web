"use client"

import { useApolloClient } from "@apollo/client"
import {
  CommunityDeletionAcceptanceDocument,
  MyCommunitiesDocument,
  useAcceptCommunityDeletionMutation,
} from "@/infrastructure/graphql/generated"

export type CommunityDeletionAcceptanceOutcome =
  | { kind: "accepted"; sync: "succeeded" | "failed" }
  | { kind: "review-changed" }
  | { kind: "not-accepted" }
  | { kind: "unknown" }

/**
 * 受理結果をMutationのtyped payloadから先に確定し、
 * MyCommunitiesの同期失敗が受理結果を取り消さないようにする。
 */
export const useCommunityDeletionAcceptance = (communityId: string) => {
  const client = useApolloClient()
  const [accept] = useAcceptCommunityDeletionMutation()

  const acceptDeletion = async (
    revision: string,
    operationId: string,
  ): Promise<CommunityDeletionAcceptanceOutcome> => {
    let accepted: boolean | undefined
    try {
      const result = await accept({
        variables: { input: { communityId, revision, operationId } },
      })
      accepted = result.data?.acceptCommunityDeletion?.accepted
    } catch (caught) {
      const graphError = caught as {
        graphQLErrors?: Array<{ extensions?: { code?: string } }>
      }
      if (
        graphError?.graphQLErrors?.some(
          (item) => item.extensions?.code === "CONFLICT",
        )
      ) {
        return { kind: "review-changed" }
      }
      // 通信例外ではServerでの受付成立を推測しない。
      return { kind: "unknown" }
    }

    if (accepted === false) return { kind: "not-accepted" }
    if (accepted !== true) return { kind: "unknown" }

    try {
      // refetchQueriesは監視中のQueryが存在しない場合、通信なしで空配列を返し得る。
      // 対象Communityを離れる前にMyCommunitiesを必ずnetwork-onlyで取得する。
      const refreshed = await client.query({
        query: MyCommunitiesDocument,
        fetchPolicy: "network-only",
      })
      const synced = !!refreshed.data && !refreshed.error && !refreshed.errors?.length
      return { kind: "accepted", sync: synced ? "succeeded" : "failed" }
    } catch {
      // 受付は確定済み。再取得失敗によってMutationを再送しない。
      return { kind: "accepted", sync: "failed" }
    }
  }

  const inspectAcceptance = async (operationId: string): Promise<boolean> => {
    try {
      const inspected = await client.query({
        query: CommunityDeletionAcceptanceDocument,
        variables: { operationId },
        fetchPolicy: "network-only",
      })
      return inspected.data?.communityDeletionAcceptance?.accepted === true &&
        !inspected.error && !inspected.errors?.length
    } catch {
      // 未検出や通信例外を「未受付」と判定しない。
      return false
    }
  }

  return { acceptDeletion, inspectAcceptance }
}
