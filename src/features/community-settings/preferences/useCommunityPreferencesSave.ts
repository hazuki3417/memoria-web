"use client"

import { useMemo } from "react"
import { useApolloClient } from "@apollo/client"
import {
  CommunityMySettingsDocument,
  UpdateCommunitySettingsDocument,
  type OperationUpdateCommunitySettingsMutation,
  type OperationUpdateCommunitySettingsMutationVariables,
} from "@/infrastructure/graphql/generated"
import { SettingsInputValidationError, requireSettingsMutationOutcome } from "@/infrastructure/graphql/settingsMutationResult"
import { commitCommunitySettingsPatch } from "./communitySettingsCache"
import { isCommunityAccentColor, type CommunityPreferencesPatch, type CommunityPreferencesValues } from "./communityPreferences"
import { classifyCommunityPreferencesSaveFailure } from "./classifyCommunityPreferencesSaveFailure"
import type { CommunityPreferencesSaveOperations, SaveCommunityPreferencesAction } from "./communityPreferencesSaveOutcome"

/** Community ID固定の保存・現在値照会・確定Cache反映を提供する。 */
export const useCommunityPreferencesSave = (communityId: string): CommunityPreferencesSaveOperations => {
  const client = useApolloClient()
  return useMemo(() => {
    const save: SaveCommunityPreferencesAction = async (patch) => {
      try {
        // ApolloClient.mutate is independent of a view-mounted useMutation hook.
        const result = await client.mutate<
          OperationUpdateCommunitySettingsMutation,
          OperationUpdateCommunitySettingsMutationVariables
        >({
          mutation: UpdateCommunitySettingsDocument,
          fetchPolicy: "no-cache",
          errorPolicy: "all",
          variables: { input: { communityId, ...patch } },
        })
        const outcome = requireSettingsMutationOutcome(result.data?.updateCommunitySettings, result)
        if (outcome?.__typename === "InputValidationFailure")
          throw new SettingsInputValidationError(outcome.violations)
        const confirmed = outcome?.__typename === "UpdateCommunitySettingsSuccess"
          ? outcome.settings.accentColor : undefined
        if (!confirmed || !isCommunityAccentColor(confirmed)) throw new Error("Accent save response invalid")
        // A confirmed write remains authoritative even after this view unmounts.
        try {
          commitCommunitySettingsPatch(client.cache, communityId, { accentColor: confirmed.toUpperCase() })
        } catch {
          // Cache synchronization failure does not undo a confirmed Mutation.
          void client.refetchQueries({ include: [CommunityMySettingsDocument] }).catch(() => undefined)
        }
        return { kind: "success", value: { accentColor: confirmed.toUpperCase() } }
      } catch (error) {
        return classifyCommunityPreferencesSaveFailure(error)
      }
    }
    const observe = async (): Promise<CommunityPreferencesValues> => {
      const result = await client.query({
        query: CommunityMySettingsDocument,
        variables: { communityId },
        fetchPolicy: "no-cache",
      })
      const current = result.data?.community?.mySettings.accentColor
      if (!current || !isCommunityAccentColor(current)) throw new Error("Community accent unavailable")
      return { accentColor: current }
    }
    const confirm = (patch: CommunityPreferencesPatch) => {
        try {
          commitCommunitySettingsPatch(client.cache, communityId, patch)
        } catch {
          void client.refetchQueries({ include: [CommunityMySettingsDocument] }).catch(() => undefined)
        }
    }
    // 保存結果・現在値照会・明示確認に必要な操作を固定Community IDで提供する。
    return { save, observe, confirm }
  }, [client, communityId])
}
