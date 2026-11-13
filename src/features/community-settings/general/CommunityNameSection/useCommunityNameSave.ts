"use client"

import { useApolloClient } from "@apollo/client"
import { CommunitySettingsNameInspectionDocument, MyCommunitiesDocument, useUpdateCommunityMutation } from "@/infrastructure/graphql/generated"
import {
  SettingsGraphQLExecutionError,
  classifySettingsSaveFailure,
} from "@/infrastructure/graphql/settingsMutationResult"
import { createActionAdapter, type ActionOutcome } from "@/ui/Action"
import { classifyCommunityNameMutationResult } from "./classifyCommunityNameMutationResult"
import type { CommunityNameSaveRejection, SaveCommunityName } from "./communityNameSaveOutcome"

/** Community IDを固定したMutationを実行し、結果の確実性を失わず保存結果を提供する。 */
export const useCommunityNameSave = (communityId: string) => {
  const client = useApolloClient()
  const [updateCommunity] = useUpdateCommunityMutation()

  const classifyError = (error: unknown): ActionOutcome<string, CommunityNameSaveRejection> => {
    const kind = classifySettingsSaveFailure(error)
    if (kind === "blocked") return { kind: "rejected", reason: { kind, error } }
    if (kind === "retryable") return { kind: "rejected", reason: { kind } }
    return { kind: "unknown" }
  }

  const execute = (name: string) => updateCommunity({
    variables: { input: { communityId, name } },
    errorPolicy: "all",
    // 成功後のCommunity一覧更新は操作の成立判定と独立させる。
    refetchQueries: [MyCommunitiesDocument],
    awaitRefetchQueries: false,
  })

  const classify = (
    response: Awaited<ReturnType<typeof execute>>,
  ): ActionOutcome<string, CommunityNameSaveRejection> => {
    const result = response.data?.updateCommunity
    if (result) return classifyCommunityNameMutationResult(result)
    if (response.errors?.length) {
      return classifyError(new SettingsGraphQLExecutionError(response.errors))
    }
    return { kind: "unknown" }
  }

  const onSaveName: SaveCommunityName = createActionAdapter({
    execute,
    classify,
    classifyError,
  })

  /** MutationのOutcomeを変更せず、結果不明時にはCacheを介さず現在の名前を照会する。 */
  const onInspectName = async (): Promise<string> => {
    const current = await client.query({
      query: CommunitySettingsNameInspectionDocument,
      variables: { communityId },
      fetchPolicy: "no-cache",
    })
    if (!current.data?.community) throw new Error("Community not available")
    return current.data.community.name
  }

  /** Community名の保存Actionと、読み取り専用の現在値照会を提供する。 */
  return { onSaveName, onInspectName }
}
