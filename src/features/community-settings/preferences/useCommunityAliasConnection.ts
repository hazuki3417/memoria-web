"use client"

import { useApolloClient } from "@apollo/client"
import {
  CommunityMySettingsDocument,
  useUpdateCommunitySettingsMutation,
} from "@/infrastructure/graphql/generated"
import {
  SettingsInputValidationError,
  requireSettingsMutationOutcome,
} from "@/infrastructure/graphql/settingsMutationResult"
import { commitCommunitySettingsPatch } from "./ConnectedCommunityPreferences/communitySettingsCache"

/** Owns Community Alias observation and mutation without stale refetch side effects. */
export function useCommunityAliasConnection(communityId: string) {
  const client = useApolloClient()
  const [save] = useUpdateCommunitySettingsMutation()

  const inspectAlias = async () => {
    const current = await client.query({
      query: CommunityMySettingsDocument,
      variables: { communityId },
      fetchPolicy: "no-cache",
    })
    if (!current.data?.community) throw new Error("Community unavailable")
    return current.data.community.mySettings.alias
  }

  const saveAlias = async (alias: string | null) => {
    const result = await save({
      fetchPolicy: "no-cache",
      errorPolicy: "all",
      variables: { input: { communityId, alias } },
    })
    const outcome = requireSettingsMutationOutcome(result.data?.updateCommunitySettings, result)
    if (outcome?.__typename === "InputValidationFailure")
      throw new SettingsInputValidationError(outcome.violations)
    const settings =
      outcome?.__typename === "UpdateCommunitySettingsSuccess"
        ? outcome.settings
        : undefined
    if (!settings || settings.alias !== alias) {
      throw new Error("Community alias save unconfirmed")
    }
    commitCommunitySettingsPatch(client.cache, communityId, {
      alias: settings.alias,
    })
    // Both subscribed views share the normalized Community fragment.
    // Refetching either after this write may reintroduce an older
    // Accent/Alias snapshot while the other field is in flight.
  }

  return { inspectAlias, saveAlias }
}
