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

const isHex = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value)

/** Community ID固定の保存・現在値照会・確定Cache反映を提供する。 */
export const useCommunityPreferencesSave = (communityId: string) => {
  const client = useApolloClient()
  return useMemo(() => {
    const save = async (next: string) => {
        // ApolloClient.mutate is independent of a view-mounted useMutation hook.
        const result = await client.mutate<
          OperationUpdateCommunitySettingsMutation,
          OperationUpdateCommunitySettingsMutationVariables
        >({
          mutation: UpdateCommunitySettingsDocument,
          fetchPolicy: "no-cache",
          errorPolicy: "all",
          variables: { input: { communityId, accentColor: next } },
        })
        const outcome = requireSettingsMutationOutcome(result.data?.updateCommunitySettings, result)
        if (outcome?.__typename === "InputValidationFailure")
          throw new SettingsInputValidationError(outcome.violations)
        const confirmed = outcome?.__typename === "UpdateCommunitySettingsSuccess"
          ? outcome.settings.accentColor : undefined
        if (!confirmed || !isHex(confirmed)) throw new Error("Accent save response invalid")
        // A confirmed write remains authoritative even after this view unmounts.
        try {
          commitCommunitySettingsPatch(client.cache, communityId, { accentColor: confirmed.toUpperCase() })
        } catch {
          // Cache synchronization failure does not undo a confirmed Mutation.
          void client.refetchQueries({ include: [CommunityMySettingsDocument] }).catch(() => undefined)
        }
        return confirmed
    }
    const observe = async () => {
        const result = await client.query({
          query: CommunityMySettingsDocument,
          variables: { communityId },
          fetchPolicy: "no-cache",
        })
        const current = result.data?.community?.mySettings.accentColor
        if (!current || !isHex(current)) throw new Error("Community accent unavailable")
        return current
    }
    const confirm = (color: string) => {
        try {
          commitCommunitySettingsPatch(client.cache, communityId, { accentColor: color })
        } catch {
          void client.refetchQueries({ include: [CommunityMySettingsDocument] }).catch(() => undefined)
        }
    }
    return { save, observe, confirm }
  }, [client, communityId])
}
