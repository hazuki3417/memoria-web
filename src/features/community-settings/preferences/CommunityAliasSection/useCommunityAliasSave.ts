"use client"

import { useApolloClient } from "@apollo/client"
import {
  CommunityMySettingsDocument,
  MyCommunitiesDocument,
  useUpdateCommunitySettingsMutation,
} from "@/infrastructure/graphql/generated"
import {
  SettingsGraphQLExecutionError,
  classifySettingsSaveFailure,
} from "@/infrastructure/graphql/settingsMutationResult"
import { createActionAdapter, type ActionOutcome } from "@/ui/Action"
import {
  classifyCommunityAliasMutationResult,
} from "./classifyCommunityAliasMutationResult"
import type {
  CommunityAliasSaveRejection,
  SaveCommunityAlias,
} from "./communityAliasSaveOutcome"
import { commitCommunitySettingsPatch } from "../communityPreferencesCache"

/** Community ID固定のAlias保存と確定Cache反映を提供する。 */
export const useCommunityAliasSave = (communityId: string) => {
  const client = useApolloClient()
  const [mutation] = useUpdateCommunitySettingsMutation()

  const classifyError = (error: unknown): ActionOutcome<string | null, CommunityAliasSaveRejection> => {
    const kind = classifySettingsSaveFailure(error)
    if (kind === "blocked") return { kind: "rejected", reason: { kind, error } }
    if (kind === "retryable") return { kind: "rejected", reason: { kind } }
    return { kind: "unknown" }
  }

  const execute = async (alias: string | null) => {
    const response = await mutation({
      fetchPolicy: "no-cache",
      errorPolicy: "all",
      variables: { input: { communityId, alias } },
    })
    return { response, alias }
  }

  const classify = (
    { response, alias }: Awaited<ReturnType<typeof execute>>,
  ): ActionOutcome<string | null, CommunityAliasSaveRejection> => {
    const result = response.data?.updateCommunitySettings
    if (result) return classifyCommunityAliasMutationResult(result, alias)
    if (response.errors?.length) {
      return classifyError(new SettingsGraphQLExecutionError(response.errors))
    }
    return { kind: "unknown" }
  }

  const confirmAlias = (alias: string | null) => {
    try {
      if (commitCommunitySettingsPatch(client.cache, communityId, { alias })) return
    } catch {
      // 保存OutcomeとCache同期失敗を区別する。
    }
    try {
      void client.refetchQueries({
        include: [CommunityMySettingsDocument, MyCommunitiesDocument],
        onQueryUpdated: (query) => {
          const targetId = query.variables?.communityId
          return targetId === undefined || targetId === communityId
            ? query.refetch()
            : false
        },
      }).catch(() => undefined)
    } catch {
      // 保存Outcomeと取得同期は独立している。
    }
  }

  const afterSuccess = (alias: string | null) => {
    // 確定したAliasフィールドのみを更新し、並行保存のAccentを上書きしない。
    confirmAlias(alias)
  }

  const saveAlias: SaveCommunityAlias = createActionAdapter({
    execute,
    classify,
    classifyError,
    afterSuccess,
  })

  /** Alias保存の確定結果とCache更新を提供する。 */
  return { saveAlias }
}
