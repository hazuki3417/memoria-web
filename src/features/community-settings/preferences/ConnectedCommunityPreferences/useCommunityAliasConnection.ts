"use client"

import { useApolloClient } from "@apollo/client"
import {
  CommunityMySettingsDocument,
  useUpdateCommunitySettingsMutation,
} from "@/infrastructure/graphql/generated"
import {
  SettingsGraphQLExecutionError,
  classifySettingsSaveFailure,
} from "@/infrastructure/graphql/settingsMutationResult"
import { createActionAdapter, type ActionOutcome } from "@/ui/Action"
import {
  classifyCommunityAliasMutationResult,
} from "../CommunityAliasSection/classifyCommunityAliasMutationResult"
import type {
  CommunityAliasSaveRejection,
  SaveCommunityAlias,
} from "../CommunityAliasSection/communityAliasSaveOutcome"
import { commitCommunitySettingsPatch } from "./communitySettingsCache"

/** Community ID固定のAlias保存と、Cacheに影響しない結果不明時の照会を提供する。 */
export const useCommunityAliasConnection = (communityId: string) => {
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

  const afterSuccess = (alias: string | null) => {
    // 確定したAliasフィールドのみを更新し、並行保存のAccentを上書きしない。
    commitCommunitySettingsPatch(client.cache, communityId, { alias })
  }

  const saveAlias: SaveCommunityAlias = createActionAdapter({
    execute,
    classify,
    classifyError,
    afterSuccess,
  })

  const inspectAlias = async (): Promise<string | null> => {
    const current = await client.query({
      query: CommunityMySettingsDocument,
      variables: { communityId },
      fetchPolicy: "no-cache",
    })
    if (!current.data?.community) throw new Error("Community unavailable")
    return current.data.community.mySettings.alias
  }

  return { inspectAlias, saveAlias }
}
