"use client"

import { useMemo } from "react"
import { useApolloClient } from "@apollo/client"
import {
  CommunityMySettingsDocument,
  UpdateCommunitySettingsDocument,
  type OperationUpdateCommunitySettingsMutation,
  type OperationUpdateCommunitySettingsMutationVariables,
} from "@/infrastructure/graphql/generated"
import {
  SettingsGraphQLExecutionError,
  classifySettingsSaveFailure,
  getSettingsInputViolations,
} from "@/infrastructure/graphql/settingsMutationResult"
import { createActionAdapter } from "@/ui/Action"
import { commitCommunitySettingsPatch } from "./communitySettingsCache"
import { fromGraphqlCommunityPreferences, toGraphqlCommunityPreferencesPatch } from "./communityPreferencesGraphqlAdapter"
import { isCommunityAccentColor, type CommunityPreferencesPatch, type CommunityPreferencesValues } from "./communityPreferences"
import { classifyCommunityPreferencesMutationResult } from "./classifyCommunityPreferencesMutationResult"
import type { CommunityPreferencesSaveOperations, CommunityPreferencesSaveOutcome, SaveCommunityPreferencesAction } from "./communityPreferencesSaveOutcome"

/** Community ID固定の保存・現在値照会・確定Cache反映を提供する。 */
export const useCommunityPreferencesSave = (communityId: string): CommunityPreferencesSaveOperations => {
  const client = useApolloClient()
  return useMemo(() => {
    const execute = (patch: CommunityPreferencesPatch) =>
      client.mutate<
        OperationUpdateCommunitySettingsMutation,
        OperationUpdateCommunitySettingsMutationVariables
      >({
        mutation: UpdateCommunitySettingsDocument,
        fetchPolicy: "no-cache",
        errorPolicy: "all",
        variables: { input: toGraphqlCommunityPreferencesPatch(communityId, patch) },
      })

    const classifyError = (error: unknown): CommunityPreferencesSaveOutcome => {
      const kind = classifySettingsSaveFailure(error)
      if (kind === "unknown") return { kind: "unknown" }
      if (kind === "blocked") return { kind: "rejected", reason: { kind, error } }
      // 従来のCommunity契約を維持する。Typed Violationのない拒否はForm Errorにする。
      if (kind === "validation")
        return { kind: "rejected", reason: { kind, violations: getSettingsInputViolations(error) } }
      return { kind: "rejected", reason: { kind: "rejected" } }
    }

    const classify = (
      response: Awaited<ReturnType<typeof execute>>,
    ): CommunityPreferencesSaveOutcome => {
      const result = response.data?.updateCommunitySettings
      if (result) return classifyCommunityPreferencesMutationResult(result)
      if (response.errors?.length)
        return classifyError(new SettingsGraphQLExecutionError(response.errors))
      return { kind: "unknown" }
    }

    const confirm = (patch: CommunityPreferencesPatch) => {
      try {
        if (commitCommunitySettingsPatch(client.cache, communityId, patch)) return
      } catch {
        // Cache同期失敗は保存Outcomeとは別に扱う。
      }
      void client.refetchQueries({
        include: [CommunityMySettingsDocument],
        onQueryUpdated: (query) => query.variables.communityId === communityId ? query.refetch() : false,
      }).catch(() => undefined)
    }

    const afterSuccess = (values: CommunityPreferencesValues) => {
      // 確定したAccentだけを更新し、並行するAlias保存を上書きしない。
      confirm({ accentColor: values.accentColor })
    }

    const save: SaveCommunityPreferencesAction = createActionAdapter({
      execute,
      classify,
      classifyError,
      afterSuccess,
    })

    const observe = async (): Promise<CommunityPreferencesValues> => {
      const result = await client.query({
        query: CommunityMySettingsDocument,
        variables: { communityId },
        fetchPolicy: "no-cache",
      })
      const settings = result.data?.community?.mySettings
      if (!settings?.accentColor || !isCommunityAccentColor(settings.accentColor)) throw new Error("Community accent unavailable")
      return fromGraphqlCommunityPreferences(settings)
    }

    return { save, observe, confirm }
  }, [client, communityId])
}
