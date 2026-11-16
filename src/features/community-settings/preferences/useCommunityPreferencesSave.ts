"use client"

import { useMemo } from "react"
import { useApolloClient } from "@apollo/client"
import { settingsInspectionContext } from "@/infrastructure/graphql/settingsCacheReadProtection"
import {
  CommunityMySettingsDocument,
  MyCommunitiesDocument,
  UpdateCommunitySettingsDocument,
  type OperationCommunityMySettingsQuery,
  type OperationUpdateCommunitySettingsMutation,
  type OperationUpdateCommunitySettingsMutationVariables,
} from "@/infrastructure/graphql/generated"
import {
  SettingsGraphQLExecutionError,
  classifySettingsSaveFailure,
  getSettingsInputViolations,
} from "@/infrastructure/graphql/settingsMutationResult"
import { createActionAdapter } from "@/ui/Action"
import { commitCommunitySettingsPatch } from "./communityPreferencesCache"
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
      try {
        void client.refetchQueries({
          include: [CommunityMySettingsDocument, MyCommunitiesDocument],
          onQueryUpdated: (query) => !query.variables.communityId || query.variables.communityId === communityId ? query.refetch() : false,
        }).catch(() => undefined)
      } catch {
        // 保存Outcomeと取得同期は独立している。
      }
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
        context: settingsInspectionContext,
      })
      const settings = result.data?.community?.mySettings
      if (!settings?.accentColor || !isCommunityAccentColor(settings.accentColor)) throw new Error("Community accent unavailable")
      return fromGraphqlCommunityPreferences(settings)
    }

    const isAccentConfirmed = (color: string) => {
      try {
        const current = client.cache.readQuery<OperationCommunityMySettingsQuery>({
          query: CommunityMySettingsDocument,
          variables: { communityId },
          returnPartialData: true,
        })?.community
        return current?.id === communityId && current?.mySettings?.accentColor === color
      } catch {
        return false
      }
    }

    return { save, observe, confirm, isAccentConfirmed }
  }, [client, communityId])
}
